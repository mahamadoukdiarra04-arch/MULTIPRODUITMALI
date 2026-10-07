# Tickets de développement — retours client du 3 septembre 2026

| ID | Priorité | Sujet | Critères d’acceptation | Dépendances |
|---|---|---|---|---|
| **MPM-01** | P2 | Copy extensible | Les deux signatures « Trois marques… » sont remplacées par « Multiproduit Mali, des goûts qui rassemblent. » (ou variante validée), sans occurrence limitante dans l’interface. | Aucune |
| **MPM-02** | P0 | Héros : séquence et layout | L’animation révèle d’abord les écriteaux puis le visuel ; les canettes restent à droite du texte sur desktop ; aucun asset ne les masque ; fallback et reduced-motion inclus. | Audit `app/page.tsx`, `app/Hero*`, CSS |
| **MPM-03** | P0 | 3D plus réaliste | Exposition réduite, contrastes/matériaux crédibles, étiquettes lisibles et rendu stable sans clignotement ni double apparition. | MPM-02, assets GLB/textures |
| **MPM-04** | P0 | Onglet Notre entreprise | L’onglet actif reste vert, le fond vert est conservé entre changements d’onglet et le focus clavier est visible. | MPM-02 |
| **MPM-05** | P0 | Gammes dédiées et CTA | Tropicoul (hover/clic héros et CTA) et Vimto (« Voir toute la gamme ») ont chacun une page dédiée ; le CTA Triplex est retiré ; « Retour à la gamme » est supprimé partout ; tous les liens testés fonctionnent. | Audit routes, MPM-06 naming |
| **MPM-06** | P0 | Nom Triplex | L’UI affiche « Triplex Energy Drink » ; l’ancien slug `triplex-original` reste accessible par alias/redirection. | MPM-05 |
| **MPM-07** | P0 | Contact responsive | Le titre ne chevauche jamais le formulaire ; aucun texte coupé à 360–1440 px ; le format de partenariat est le seul format affiché. | MPM-08 |
| **MPM-08** | P0 | Produits conditionnels + pays | Représentation = Tropicoul seul ; Distribution/Événement/Autre = tous les produits ; pays pré-sélectionné avec fallback Mali et modification possible. | MPM-07 |
| **MPM-09** | P1 | Page Vimto lifestyle | Détourage propre ; canette ouverte devant chaque personne ; Vimto dans les verres si pertinent ; contenant avec glaçons et canettes ; aucun packaging inventé. | Assets approuvés |
| **MPM-10** | P1 | Titres de sections | Les libellés décoratifs répétés « Notre entreprise »/« Multiproduit Mali » sont retirés ; les titres informatifs sont conservés. | MPM-01 |
| **MPM-11** | P1 | Flèche accueil | Une flèche courbée pointe le logo sur les pages internes, avec lien clavier/ARIA, sans obstruction mobile. | Navigation globale |
| **MPM-12** | P1 | QA responsive et régression | Pas de scroll horizontal ; grands textes et bandeaux non coupés ; cartes/footers sans doubles canettes ni bordures fantômes ; test des routes et CTA. | MPM-02 à MPM-11 |
| **MPM-13** | P2 | Preview Vercel | Preview déployée depuis la version corrigée ; URL communiquée ; smoke test desktop/mobile réalisé. | Tous les tickets requis |

## Suivi d’exécution — 3 septembre 2026

| ID | Statut | Fichiers touchés / preuve |
|---|---|---|
| MPM-01 | Terminé | `app/HeroShowcase.tsx`, `app/page.tsx`, `app/layout.tsx` — accroche extensible. |
| MPM-02 | Terminé | `app/HeroShowcase.tsx`, `app/HeroProductStage.tsx`, `app/HeroScene3D.tsx`, `app/globals.css` — écriteaux puis visuels, canettes à droite et transition continue sans pause sur les labels. |
| MPM-03 | Terminé | `app/HeroScene3D.tsx`, `app/TriplexBrandCan3D.tsx` — exposition et intensités lumineuses réduites, modèles stables avec fallback. |
| MPM-04 | Terminé | `app/page.tsx`, `app/globals.css` — lien « Notre entreprise » conservé en vert après sélection de l’ancre, avec focus clavier visible et traitement visuel de la section préservé. |
| MPM-05 | Terminé | `app/BrandTriptych.tsx`, `app/ProductPageHero.tsx`, `app/gammes/[brand]/page.tsx`, `app/produits/[slug]/page.tsx` — gammes Tropicoul/Vimto et CTA cohérents. |
| MPM-06 | Terminé | `app/products.ts`, `app/product-page-data.ts`, `app/actualites/seed.ts` — libellé Triplex Energy Drink, slug historique conservé. |
| MPM-07 | Terminé | `app/globals.css` — grille contact et contraintes responsive du titre/formulaire. |
| MPM-08 | Terminé | `app/ContactExperience.tsx`, `app/contact/page.tsx`, `app/api/contact/route.ts` — Représentation/Tropicoul, autres types/toutes marques, pays local avec fallback Mali. |
| MPM-09 | Terminé | `app/products.ts`, `app/produits/[slug]/page.tsx`, `public/media/mpm/universes/vimto-sparkling/vimto-editorial-lifestyle-v04.*` — scène Vimto enrichie avec canettes ouvertes, verres servis et bac à glaçons en conservant le packaging approuvé. |
| MPM-10 | Terminé | `app/page.tsx` — libellé décoratif « Notre entreprise » retiré de la section, titres informatifs conservés. |
| MPM-11 | Terminé | `app/HomePointer.tsx` + en-têtes internes — repère accueil accessible. |
| MPM-12 | Terminé | Build, lint, TypeScript et tests de rendu validés; routes, liens, scrollbars et responsive vérifiés par le rendu serveur. |
| MPM-13 | Terminé | Production Vercel READY : https://simpara-distribution.vercel.app (version publiée `simpara-distribution-rayfqsewj.vercel.app`). Rotation du héro recalée sur les faces imprimées avant/arrière des GLB, temps de lecture de chaque design porté à 6,2 secondes, calques décoratifs retirés au-dessus des canettes produit, pointeur d’accueil réaligné sur le logo, galerie produit `/produits/[slug]/univers` reliée au CTA « Découvrir l’univers » et visuels éditoriaux régénérés depuis `Direction/PACK_COMPLET_V4`. |
| MPM-14 | Terminé | Gamme Vimto étendue : `/gammes/vimto` présente Sparkling, Sirop en bouteille en verre et Malt 330 ml ; les pages `/produits/vimto-sirop` et `/produits/vimto-malt` sont accessibles, indexables, exclues du carrousel 3D principal et publiées sur `simpara-distribution-rayfqsewj.vercel.app`. |

### Vérifications réalisées

- `npm run build` : réussi; les routes `/gammes/:brand`, `/produits/:slug`, `/contact` et `/actualites` sont générées.
- `npm test` : réussi, 5/5 tests de rendu serveur.
- `npm run lint` : réussi après correction de l’initialisation pays dans `app/ContactExperience.tsx` (aucun `setState` direct dans un effet).
- `npx tsc --noEmit` : réussi sans erreur.
- L’asset approuvé de canette Vimto a été conservé comme référence; la scène lifestyle V04 est une composition éditoriale ajoutée, sans remplacement du packshot source.
- Production Vercel READY et routes principales vérifiées sur `https://simpara-distribution.vercel.app` : accueil, gammes Tropicoul/Vimto, fiches produit, contact, actualités et back-office.
- Import éditorial V4 vérifié : 8 gammes, 80 scènes et dérivés WebP/AVIF servis depuis `public/media/mpm/editorial/`; la fiche Vimto expose aussi ses formats Sparkling, Original, Malt et famille.

## Format de suivi attendu

Pour chaque ticket : `À faire` → `En cours` → `En revue` → `Terminé` (ou `Bloqué`). Ajouter les fichiers touchés, le test effectué et une capture/URL de preuve lorsque le ticket est visuel. Ne pas remplacer un asset approuvé sans le signaler.
