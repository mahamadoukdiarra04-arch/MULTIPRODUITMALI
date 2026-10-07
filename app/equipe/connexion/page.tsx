import { redirect } from "next/navigation";

import { getEditorialUser } from "../../actualites/access";
import { EditorialFooter } from "../../actualites/EditorialFooter";
import { EditorialHeader } from "../../actualites/EditorialHeader";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

type LoginPageProps = { searchParams: Promise<{ retour?: string }> };

function safeReturnPath(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/actualites/back-office";
}

export default async function TeamLoginPage({ searchParams }: LoginPageProps) {
  const returnTo = safeReturnPath((await searchParams).retour);
  if (await getEditorialUser()) redirect(returnTo);

  return (
    <div className="editorial-page">
      <EditorialHeader />
      <main className="team-login" id="main-content">
        <section>
          <p>ESPACE ÉQUIPE</p>
          <h1>Retrouvez l’administration Multiproduit Mali.</h1>
          <span>Connectez-vous pour préparer les publications, voir leur impact sur le site et modérer les discussions.</span>
          <LoginForm returnTo={returnTo} />
        </section>
      </main>
      <EditorialFooter />
    </div>
  );
}
