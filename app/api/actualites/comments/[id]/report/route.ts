import { reportComment } from "../../../../../../db/editorial";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const payload = await request.json().catch(() => ({})) as { kind?: unknown };
    const kind = payload.kind === "translation" ? "translation" : "comment";
    await reportComment(id, kind);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Le signalement est indisponible." }, { status: 503 });
  }
}
