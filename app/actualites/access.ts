import { env } from "cloudflare:workers";

import { getChatGPTUser, type ChatGPTUser } from "../chatgpt-auth";

function allowedEmails() {
  const runtime = env as unknown as { MULTIPRODUIT_EDITOR_EMAILS?: string };
  return new Set(
    (runtime.MULTIPRODUIT_EDITOR_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLocaleLowerCase())
      .filter(Boolean),
  );
}

export function isEditorialTeamMember(email: string) {
  return allowedEmails().has(email.toLocaleLowerCase());
}

export async function getEditorialUser(): Promise<ChatGPTUser | null> {
  const user = await getChatGPTUser();
  return user && isEditorialTeamMember(user.email) ? user : null;
}
