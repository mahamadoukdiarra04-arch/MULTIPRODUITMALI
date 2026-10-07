import { cookies } from "next/headers";

import { authenticateEditorialAdmin } from "../../../../db/admin-auth";
import { EDITORIAL_SESSION_COOKIE } from "../../../actualites/access";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { email?: unknown; password?: unknown };
    const email = typeof payload.email === "string" ? payload.email.trim().slice(0, 254) : "";
    const password = typeof payload.password === "string" ? payload.password.slice(0, 200) : "";
    if (!email || !password) return Response.json({ error: "Renseignez votre adresse e-mail et votre mot de passe." }, { status: 400 });

    const result = await authenticateEditorialAdmin(email, password);
    if (!result) return Response.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });

    const cookieStore = await cookies();
    cookieStore.set(EDITORIAL_SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(result.expiresAt),
    });
    return Response.json({ user: result.user });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "La connexion a échoué." }, { status: 400 });
  }
}
