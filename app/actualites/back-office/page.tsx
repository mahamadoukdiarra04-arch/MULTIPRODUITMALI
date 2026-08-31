import { listModerationComments, listPublications } from "../../../db/editorial";
import { getChatGPTUser } from "../../chatgpt-auth";
import { isEditorialTeamMember } from "../access";
import { EditorialBackOffice } from "../EditorialBackOffice";
import { EditorialFooter } from "../EditorialFooter";
import { EditorialHeader } from "../EditorialHeader";

export const dynamic = "force-dynamic";

export default async function EditorialBackOfficePage() {
  const user = await getChatGPTUser();
  const localPreview = process.env.NODE_ENV === "development" || process.env.MULTIPRODUIT_STANDALONE_PREVIEW === "1";
  if (!user && !localPreview) return <div className="editorial-page"><EditorialHeader /><main className="back-office-denied" id="main-content"><p>ESPACE ÉQUIPE</p><h1>Connexion équipe requise.</h1><span>Connectez-vous avec une adresse autorisée par Multiproduit Mali pour créer, publier et modérer.</span></main><EditorialFooter /></div>;
  if (user && !isEditorialTeamMember(user.email)) return <div className="editorial-page"><EditorialHeader /><main className="back-office-denied" id="main-content"><p>ESPACE ÉQUIPE</p><h1>Accès non autorisé.</h1><span>Cette adresse n’est pas encore inscrite dans l’accès éditorial Multiproduit Mali.</span></main><EditorialFooter /></div>;
  const [publications, comments] = await Promise.all([listPublications({ includePrivate: true }), listModerationComments()]);
  return <div className="editorial-page"><EditorialHeader /><main id="main-content"><EditorialBackOffice initialPublications={publications} initialComments={comments} displayName={user?.displayName ?? "Aperçu local"} previewOnly={!user} /></main><EditorialFooter /></div>;
}
