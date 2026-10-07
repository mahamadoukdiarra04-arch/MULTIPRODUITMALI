import { cookies } from "next/headers";

import { invalidateEditorialSession } from "../../../../db/admin-auth";
import { EDITORIAL_SESSION_COOKIE } from "../../../actualites/access";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(EDITORIAL_SESSION_COOKIE)?.value;
  if (token) await invalidateEditorialSession(token);
  cookieStore.delete(EDITORIAL_SESSION_COOKIE);
  return Response.redirect(new URL("/equipe/connexion", request.url), 303);
}
