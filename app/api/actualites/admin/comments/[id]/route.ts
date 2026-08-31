import { moderateComment, replyAsEditorialTeam } from "../../../../../../db/editorial";
import { getEditorialUser } from "../../../../../actualites/access";
import { cleanParagraphs, parseCommentStatus } from "../../../../../actualites/validation";

type RouteContext = { params: Promise<{ id: string }> };

async function allowed() {
  return Boolean(await getEditorialUser());
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!await allowed()) return Response.json({ error: "Accès réservé à l’équipe éditoriale." }, { status: 403 });
  try {
    const { id } = await params;
    const payload = await request.json() as { status?: unknown; isPinned?: unknown };
    const status = parseCommentStatus(payload.status);
    const isPinned = typeof payload.isPinned === "boolean" ? payload.isPinned : undefined;
    if (!status && typeof isPinned !== "boolean") return Response.json({ error: "Aucune modification valide." }, { status: 400 });
    await moderateComment(id, { status: status ?? undefined, isPinned });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "La modération a échoué." }, { status: 400 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!await allowed()) return Response.json({ error: "Accès réservé à l’équipe éditoriale." }, { status: 403 });
  try {
    const { id } = await params;
    const payload = await request.json() as { publicationId?: unknown; content?: unknown };
    const publicationId = typeof payload.publicationId === "string" ? payload.publicationId : "";
    const content = cleanParagraphs(payload.content, 1500);
    if (!publicationId || content.length < 2) return Response.json({ error: "La réponse doit comporter au moins deux caractères." }, { status: 400 });
    const replyId = await replyAsEditorialTeam({ publicationId, parentId: id, content });
    return Response.json({ id: replyId }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "La réponse a échoué." }, { status: 400 });
  }
}
