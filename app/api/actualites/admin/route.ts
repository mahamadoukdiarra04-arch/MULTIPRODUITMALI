import { listModerationComments, listPublications, savePublication } from "../../../../db/editorial";
import { getEditorialUser } from "../../../actualites/access";
import { parsePublicationInput } from "../../../actualites/validation";

async function requireTeam() {
  const user = await getEditorialUser();
  if (!user) return null;
  return user;
}

export async function GET() {
  if (!await requireTeam()) return Response.json({ error: "Accès réservé à l’équipe éditoriale." }, { status: 403 });
  try {
    const [publications, comments] = await Promise.all([
      listPublications({ includePrivate: true }),
      listModerationComments(),
    ]);
    return Response.json({ publications, comments });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Le back-office est indisponible." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  if (!await requireTeam()) return Response.json({ error: "Accès réservé à l’équipe éditoriale." }, { status: 403 });
  try {
    const payload = await request.json() as { publication?: unknown };
    const publication = parsePublicationInput(payload.publication);
    if (!publication) return Response.json({ error: "Les informations de la publication sont incomplètes." }, { status: 400 });
    return Response.json({ publication: await savePublication(publication) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "L’enregistrement a échoué." }, { status: 400 });
  }
}
