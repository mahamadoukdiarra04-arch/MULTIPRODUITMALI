import { cookies } from "next/headers";

import { getEditorialAdminSession, type EditorialAdminUser } from "../../db/admin-auth";
import { getChatGPTUser, type ChatGPTUser } from "../chatgpt-auth";

type EditorialRuntime = { MULTIPRODUIT_EDITOR_EMAILS?: string };

export const EDITORIAL_SESSION_COOKIE = "mpm_editorial_session";
export type EditorialUser = ChatGPTUser | EditorialAdminUser;

async function allowedEmails() {
  // Keep the route renderable on the Vercel visual preview where the
  // Cloudflare-only `cloudflare:workers` module is not available. The same
  // binding is still used when the app runs in its Worker environment.
  let runtime: EditorialRuntime = {};
  try {
    const workerRuntime = await import("cloudflare:workers");
    runtime = workerRuntime.env as unknown as EditorialRuntime;
  } catch {
    const processEnv = typeof process === "undefined" ? undefined : process.env;
    runtime = { MULTIPRODUIT_EDITOR_EMAILS: processEnv?.MULTIPRODUIT_EDITOR_EMAILS };
  }
  return new Set(
    (runtime.MULTIPRODUIT_EDITOR_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLocaleLowerCase())
      .filter(Boolean),
  );
}

export async function isEditorialTeamMember(email: string) {
  return (await allowedEmails()).has(email.toLocaleLowerCase());
}

export async function getEditorialUser(): Promise<EditorialUser | null> {
  const cookieStore = await cookies();
  const standaloneSession = cookieStore.get(EDITORIAL_SESSION_COOKIE)?.value;
  if (standaloneSession) {
    const standaloneUser = await getEditorialAdminSession(standaloneSession);
    if (standaloneUser) return standaloneUser;
  }

  const user = await getChatGPTUser();
  return user && await isEditorialTeamMember(user.email) ? user : null;
}
