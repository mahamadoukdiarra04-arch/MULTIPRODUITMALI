import { listModerationComments, listPublications } from "../../../db/editorial";
import { redirect } from "next/navigation";

import { getEditorialUser } from "../access";
import { EditorialBackOffice } from "../EditorialBackOffice";
import { EditorialFooter } from "../EditorialFooter";
import { EditorialHeader } from "../EditorialHeader";

export const dynamic = "force-dynamic";

export default async function EditorialBackOfficePage() {
  const user = await getEditorialUser();
  const localPreview = process.env.NODE_ENV === "development" || process.env.MULTIPRODUIT_STANDALONE_PREVIEW === "1";
  if (!user && !localPreview) redirect("/equipe/connexion?retour=/actualites/back-office");
  const [publications, comments] = await Promise.all([listPublications({ includePrivate: true }), listModerationComments()]);
  return <div className="editorial-page"><EditorialHeader /><main id="main-content"><EditorialBackOffice initialPublications={publications} initialComments={comments} displayName={user?.displayName ?? "Aperçu local"} previewOnly={!user} /></main><EditorialFooter /></div>;
}
