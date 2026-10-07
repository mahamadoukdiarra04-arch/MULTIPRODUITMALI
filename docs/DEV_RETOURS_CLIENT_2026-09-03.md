# Handoff développeur — retours client du 3 septembre 2026

**Statut :** prêt pour exécution et suivi

**Projet :** Multiproduit Mali

**Objectif :** appliquer les derniers retours client sans régression sur les pages, les routes, les CTA et les visuels 3D.

## Décisions de contenu

Le message ne doit pas limiter l’entreprise à trois marques. Remplacer les formulations « Trois marques. Trois façons de se faire plaisir. » et « Trois marques. Des goûts qui rassemblent. » par une signature extensible.

Formulation recommandée : **« Multiproduit Mali, des goûts qui rassemblent. »**

Alternative : **« Des marques qui se complètent, des goûts qui rassemblent. »**

Le nom visible de Triplex est **« Triplex Energy Drink »** partout où un produit est présenté. Préserver la compatibilité des anciennes URLs (notamment `triplex-original`) par redirection ou alias.

## Priorité P0 — à traiter en premier

### 1. Héros : séquence, composition et réalisme 3D

- La rotation d’introduction commence par les écriteaux/textes puis révèle le visuel en dernier.
- Aucun flash blanc, asset intermédiaire ou élément décoratif ne doit masquer les canettes.
- Sur desktop, les canettes sont décalées vers la droite du texte et restent lisibles ; elles ne passent pas derrière le bloc éditorial.
- Réduire la surexposition des canettes 3D : matériaux plus contrastés, métal crédible, ombres et reflets conservés, couleurs non délavées.
- Conserver un fallback propre si le WebGL/GLB tarde ou échoue.
- Augmenter la taille de « MULTIPRODUIT MALI » selon la hiérarchie visuelle validée.
- Respecter `prefers-reduced-motion` et éviter de bloquer le scroll.

### 2. Navigation et pages de gammes

- Le survol/clic de Tropicoul dans le héros ouvre une page dédiée présentant toute la gamme Tropicoul.
- « Voir toute la gamme » de Tropicoul ouvre cette même page dédiée.
- « Voir toute la gamme » de Vimto ouvre une page dédiée à la gamme Vimto.
- Retirer « Voir toute la gamme » de la page Triplex.
- Retirer « Retour à la gamme » partout.
- Vérifier chaque CTA, carte produit, logo et lien du footer sur desktop et mobile ; aucune zone visuellement cliquable ne doit être inactive.

### 3. Onglet « Notre entreprise »

- Au clic, l’onglet reste visuellement vert et son état actif est clairement identifiable.
- Le fond vert associé à l’onglet actif est conservé pendant la navigation entre onglets.
- Ne pas ajouter d’asset qui recouvre une canette ou un libellé.

### 4. Contact et formulaire

- Le titre « Construisons une présence qui a du goût. » ne doit jamais déborder ni se superposer au formulaire.
- Conserver uniquement le format de partenariat demandé.
- Les produits proposés dépendent du choix :
  - **Représentation** : Tropicoul uniquement ;
  - **Distribution**, **Événement** et **Autre** : tous les produits.
- Pré-sélectionner le pays estimé de l’utilisateur (géolocalisation/IP ou locale disponible), avec **Mali** comme fallback ; le champ reste toujours modifiable et l’estimation ne doit pas bloquer l’envoi.
- Tester au minimum les largeurs 360, 390, 768, 1024 et 1440 px.

## Priorité P1 — visuels et structure des pages produits

### 5. Page Vimto

- Améliorer les visuels lifestyle et le détourage : pas de halo, bande, rectangle ou bord résiduel autour des canettes.
- Ajouter une canette ouverte devant chaque personne et une présence de Vimto dans les verres lorsque la scène le permet.
- Ajouter un contenant crédible avec glaçons et canettes Vimto sur la page produit Vimto.
- Utiliser uniquement les assets approuvés et conserver les proportions/étiquettes locales ; ne pas inventer de packaging.

### 6. Titres de sections

- Ne pas répéter mécaniquement « Notre entreprise » ou « Multiproduit Mali » à gauche de chaque section.
- Garder un titre uniquement lorsqu’il apporte une information éditoriale ou une orientation claire.

### 7. Indication de retour à l’accueil

- Sur les pages internes, ajouter une flèche courbée discrète et stylisée qui pointe vers le logo pour signaler l’accès à l’accueil.
- Elle doit être accessible au clavier, avoir un libellé accessible et ne pas gêner les CTA ni le contenu mobile.

## Contraintes de qualité

- Aucun débordement horizontal sur mobile ; aucun texte coupé dans les grands titres ou les bandeaux.
- Les cartes et sélecteurs produits restent entièrement lisibles et utilisables au toucher.
- Les canettes 3D restent dans leur cadre, sans double rendu, découpe ou flou résiduel lors du scroll.
- Les liens historiques restent fonctionnels via redirections lorsque le libellé ou le slug change.
- Vérifier navigation clavier, focus visible, contraste, `prefers-reduced-motion` et fallback sans WebGL.
- Effectuer une passe de régression sur `/`, `/produits/*`, `/contact`, `/actualites` et les pages de gamme dédiées.
- Fournir une URL de preview Vercel après intégration et signaler tout asset manquant avant de le remplacer.

## Ordre d’exécution proposé

1. Audit des routes et CTA existants, puis MPM-02 à MPM-06 (P0).
2. Corrections visuelles Vimto et nettoyage des titres (MPM-07/08).
3. Flèche accueil, responsive, accessibilité et régression complète (MPM-09/10).
4. Preview Vercel et validation visuelle sur les cinq largeurs.

Le développeur doit mettre à jour le statut de chaque ticket, noter les fichiers touchés, les tests réalisés et les éventuels blocages.
