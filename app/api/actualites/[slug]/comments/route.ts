import { createVisitorComment, getPublicationBySlug, listComments } from "../../../../../db/editorial";
import { cleanParagraphs, cleanText } from "../../../../actualites/validation";

type RouteContext = { params: Promise<{ slug: string }> };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Une erreur est survenue.";
}

export async function GET(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const publication = await getPublicationBySlug(slug);
  if (!publication) return Response.json({ error: "Publication introuvable." }, { status: 404 });

  const order = new URL(request.url).searchParams.get("order") === "oldest" ? "oldest" : "newest";
  try {
    return Response.json({ comments: await listComments(publication.id, order) });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 503 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const publication = await getPublicationBySlug(slug);
  if (!publication) return Response.json({ error: "Publication introuvable." }, { status: 404 });

  try {
    const payload = await request.json() as { authorName?: unknown; content?: unknown; parentId?: unknown };
    const authorName = cleanText(payload.authorName, 60);
    const content = cleanParagraphs(payload.content, 1500);
    const parentId = cleanText(payload.parentId, 100) || null;
    if (authorName.length < 2 || content.length < 2) {
      return Response.json({ error: "Ajoutez un nom ou pseudonyme et un commentaire d’au moins deux caractères." }, { status: 400 });
    }

    const comment = await createVisitorComment({ publicationId: publication.id, authorName, content, parentId });
    return Response.json({ comment }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
