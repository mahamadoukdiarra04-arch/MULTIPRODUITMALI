# Checklist appel client — finalisation Multiproduit Mali

Cette liste permet de réunir toutes les informations nécessaires avant la mise en ligne définitive. Aucun mot de passe ou clé API ne doit être envoyé par messagerie non sécurisée : le client peut les saisir directement dans hPanel ou partager un accès temporaire à l’écran.

## Accès à demander

1. **Hostinger** : accès au compte qui héberge l’application, afin de créer MySQL, renseigner les variables d’environnement et relier le domaine.
2. **Point.ml** : accès de gestion de `multiproduitmali.ml`, ou disponibilité du client pour appliquer les enregistrements DNS fournis par Hostinger.
3. **Stockage médias** : pas de compte externe requis ; médias stockés sur le disque persistant Hostinger (10 Mo/image, 20 Mo/vidéo).
4. **E-mail transactionnel** : clé API Resend et adresse d’envoi validée, ainsi que l’adresse de réception des demandes du formulaire.

## Décisions à confirmer

1. **Administrateur initial** : adresse e-mail, nom affiché et mot de passe initial d’au moins 8 caractères (sans règle de casse ni symbole).
2. **E-mail de contact** : adresse qui doit recevoir les demandes du site.
3. **Adresse d’envoi** : adresse validée sur le domaine une fois le DNS actif, par exemple `contact@multiproduitmali.ml`.
4. **Informations légales** : raison sociale exacte, adresse postale, responsable de publication et, si nécessaire, liens de politique de confidentialité.
5. **Réseaux sociaux manquants** : notamment le TikTok officiel de Tropicoul lorsqu’il sera disponible.

## Actions après l’appel

1. Créer MySQL et renseigner les variables `DB_*` dans Hostinger.
2. Créer le premier compte administrateur et tester la publication d’une actualité.
3. Tester l’import d’une image puis d’une vidéo dans l’espace de gestion.
4. Configurer Resend, puis tester le formulaire de contact.
5. Relier `multiproduitmali.ml` chez Point.ml, attendre la propagation DNS et vérifier HTTPS.
6. Réaliser la recette finale : mobile, commentaires, modération, actualités, médias et formulaire.
7. Activer le déploiement automatique GitHub dans Hostinger si le client le souhaite.
