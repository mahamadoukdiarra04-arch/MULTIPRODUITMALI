import { requestCommentTranslation } from "../../../../../../db/editorial";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    return Response.json({ translation: await requestCommentTranslation(id) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "La traduction est indisponible." }, { status: 503 });
  }
}
