# Handoff développeur - Hero Multiproduit Mali

Statut : spécification validée pour itération du produit existant

Périmètre : hero de la page d'accueil uniquement

Priorité : haute

Référence UX/UI : `Questionnaire séance 1/Dossier_conception_UX_UI_Multiproduit_Mali.docx`

## 1. Objet

Le site existant constitue la base approuvée. Cette intervention ne doit pas recréer la page d'accueil ni modifier les sections situées après le hero.

L'objectif est de remplacer l'image fixe actuellement placée dans `.hero__visual` par une scène automatique présentant successivement chaque univers produit, tout en conservant le texte et les appels à l'action stables.

Le hero doit rester une introduction institutionnelle. L'animation produit soutient la compréhension de l'offre, mais ne doit jamais masquer l'identité de Multiproduit Mali, gêner le défilement ou retarder l'accès à la section suivante.

## 2. Décisions verrouillées

- Le texte et les CTA restent identiques pendant toute la rotation.
- La rotation des produits est automatique.
- Un univers reste actif environ 5 secondes.
- La transition vers l'univers suivant dure 800 ms.
- Chaque saveur Tropicoul constitue un univers distinct.
- Tous les univers Tropicoul passent avant Triplex et Vimto.
- L'ordre interne des saveurs Tropicoul n'a pas d'importance, mais il reste déterministe.
- Aucun contrôle de carrousel n'est affiché en permanence.
- Le défilement vertical reste entièrement natif.
- Le scroll ne sélectionne pas les produits et ne pilote pas la timeline.
- Aucune section n'est épinglée.
- Aucun scroll-jacking n'est autorisé.
- Sur desktop, le texte reste à gauche et la scène produit à droite.
- Sur mobile, la scène devient le fond du hero et ses assets entourent le texte et les CTA sans les masquer.
- La 3D est une amélioration progressive. Le poster 2.5D est toujours disponible.

## 3. Contenu institutionnel du hero

Le contenu ci-dessous est indépendant du produit actif.

### Français

- Surtitre : `Multiproduit Mali SARL`
- Titre : `Des boissons maliennes prêtes pour de nouveaux marchés.`
- Introduction : `Multiproduit Mali développe et distribue les marques Tropicoul, Triplex et Vimto. Nous recherchons des partenaires capables de les représenter et de les développer dans leur pays.`
- CTA principal : `Devenir partenaire`
- CTA secondaire : `Découvrir nos produits`

### Anglais

- Eyebrow : `Multiproduit Mali SARL`
- Headline : `Malian beverages ready for new markets.`
- Introduction : `Multiproduit Mali develops and distributes Tropicoul, Triplex and Vimto. We are looking for partners to represent and grow our brands in their markets.`
- Primary CTA : `Become a partner`
- Secondary CTA : `Explore our products`

Le changement de langue ne doit pas réinitialiser inutilement le produit actif si le composant reste monté.

## 4. Périmètre de modification dans le projet actuel

Points d'entrée existants :

- `app/page.tsx` contient le hero statique actuel.
- `app/globals.css` contient `.hero`, `.hero__copy`, `.hero__visual` et leurs règles responsive.
- `app/products.ts` contient Tropicoul et Triplex, mais pas Vimto.
- `public/media/simpara/` contient les posters provisoires.
- `3D/mesh/` contient quatre photographies de travail, mais aucun modèle GLB final.

Créer les modules suivants :

```text
app/
├── HeroShowcase.tsx          # composition et cycle de vie du hero
├── HeroProductStage.tsx      # scène visuelle et transitions
├── HeroScene3D.tsx           # chargement 3D différé, uniquement si nécessaire
├── hero-universes.ts         # données et ordre des univers
└── useHeroAutoplay.ts        # minuterie, pauses et visibilité
```

Modifier uniquement :

- la section `.hero` de `app/page.tsx` ;
- les règles hero de `app/globals.css` ;
- le type produit si les données communes sont réutilisées ;
- les dépendances nécessaires à la scène finale.

Ne pas réécrire les sections Entreprise, Marques, Actualités, Contact ou le footer dans cette intervention.

## 5. Nettoyage de marque obligatoire

Le nom provisoire SIMPARA ne doit plus apparaître dans l'interface finale, les attributs accessibles, les métadonnées, les courriels ou les URL publiques.

Le projet actuel contient encore ce nom dans `app/page.tsx`, `app/ProductExplorer.tsx`, les libellés accessibles et les chemins publics. Le traitement global sera réalisé dans une tâche dédiée, mais le nouveau hero ne doit introduire aucune nouvelle occurrence.

Pour les nouveaux assets, utiliser :

```text
public/media/mpm/hero/
public/models/mpm/
```

Ne pas renommer mécaniquement les anciens fichiers tant qu'une table de correspondance n'a pas été validée.

## 6. Ordre initial des univers

Ordre par défaut, modifiable uniquement dans le tableau de données :

1. Tropicoul Ananas
2. Tropicoul Orange
3. Tropicoul Mangue
4. Tropicoul Goyave
5. Tropicoul Cocktail
6. Tropicoul Tamarin
7. Triplex
8. Vimto

Ne pas mélanger l'ordre aléatoirement. Un ordre stable évite les différences d'hydratation, facilite les tests et produit des mesures analytiques comparables.

## 7. Contrat de données

Utiliser une configuration pilotée par les données. Aucun nom de produit, couleur ou chemin de média ne doit être dispersé dans le composant.

```ts
export type HeroUniverse = {
  id: string;
  brand: "Tropicoul" | "Triplex" | "Vimto";
  productName: string;
  accessibleLabel: string;
  posterSrc: string;
  modelSrc?: string;
  textureSrc?: string;
  palette: {
    background: string;
    backgroundDeep: string;
    accent: string;
    foreground: "light" | "dark";
  };
  assets: Array<{
    src: string;
    alt: "";
    desktop: { x: number; y: number; scale: number; rotate: number };
    mobile: { x: number; y: number; scale: number; rotate: number };
    depth: "back" | "mid" | "front";
  }>;
  model: {
    enabled: boolean;
    scale: number;
    rotationOffset: number;
    mobileScale: number;
  };
};
```

Règles :

- `posterSrc` est obligatoire pour publier un univers.
- `modelSrc` est facultatif et ne doit jamais conditionner l'affichage.
- Les assets décoratifs ont un texte alternatif vide.
- `foreground` pilote la couleur du texte et le traitement de contraste.
- Vimto reste désactivé tant que son poster final et sa palette validée ne sont pas disponibles.
- Aucun univers incomplet ne doit être publié avec une image générique.

## 8. Direction des univers

Les palettes finales doivent être extraites des emballages approuvés. Les indications suivantes servent à organiser les assets, pas à inventer une nouvelle identité.

| Univers | Direction |
|---|---|
| Ananas | jaune solaire, feuilles vertes, tranches d'ananas, lumière chaude |
| Orange | agrumes, mouvements circulaires, fraîcheur vive |
| Mangue | jaune-orangé, matière douce et lumineuse |
| Goyave | rose et vert, feuilles fines, ambiance généreuse |
| Cocktail | palette multicolore contrôlée, rythme plus festif |
| Tamarin | vert profond, accents chauds, univers plus mature |
| Triplex | fond sombre, lignes lumineuses nettes, énergie urbaine |
| Vimto | à définir depuis l'emballage et les assets officiels validés |

Chaque univers comprend au maximum :

- un produit principal ;
- deux couches décoratives animées en plus du produit ;
- une couche de fond non interactive ;
- un traitement de lumière ou d'ombre pour garantir le contraste.

## 9. Composition desktop

### Géométrie

- Hero : entre 86 et 92 `svh`, sans dépasser inutilement la hauteur disponible.
- Grille : texte sur 5 colonnes, scène sur 7 colonnes.
- Texte : couche stable, jamais affectée par la transition produit.
- Scène : `position: relative`, dimensions réservées avant le chargement des médias.
- La section suivante doit rester accessible par un scroll normal et apparaître immédiatement après le hero.

### Couches

```text
z-index 0 : fond de l'univers
z-index 1 : assets arrière
z-index 2 : poster ou canvas 3D du produit
z-index 3 : assets avant
z-index 4 : texte et CTA
z-index 5 : commande pause contextuelle, uniquement lorsqu'elle est révélée
```

Le produit actif reste le point focal de la scène de droite. Les assets ne traversent jamais la colonne de texte sur desktop.

## 10. Composition mobile

Le mobile n'empile pas simplement le bloc texte puis une image. La scène devient un fond immersif unique.

- Le texte et les CTA occupent la couche supérieure.
- Le produit principal reste identifiable derrière ou à côté du contenu.
- Les assets peuvent entrer dans l'espace visuel du texte pour créer de la profondeur.
- Aucun asset ne peut recouvrir les glyphes, le focus ou la surface tactile d'un CTA.
- Prévoir au moins 16 px de zone libre autour des boutons et 12 px autour des lignes de texte.
- Les assets de premier plan utilisent `pointer-events: none`.
- Le CTA principal conserve une surface tactile minimale de 48 x 48 px.
- Le texte anglais le plus long doit être testé à 360 px de large.
- Une partie de la section suivante doit rester perceptible lorsque la hauteur de l'appareil le permet.

La position de chaque asset est définie dans `hero-universes.ts`. Ne pas utiliser une position unique pour toutes les saveurs.

## 11. Autoplay et machine d'état

Constantes de départ :

```ts
export const HERO_DISPLAY_MS = 5000;
export const HERO_TRANSITION_MS = 800;
export const HERO_RESUME_DELAY_MS = 2000;
export const HERO_TOUCH_PAUSE_MS = 8000;
export const HERO_MIN_VISIBLE_RATIO = 0.55;
```

États minimaux :

```ts
type HeroPlaybackState =
  | "playing"
  | "transitioning"
  | "paused-hover"
  | "paused-focus"
  | "paused-touch"
  | "paused-hidden"
  | "paused-offscreen"
  | "reduced-motion";
```

Règles :

1. Démarrer sur le premier poster Tropicoul sans attendre la 3D.
2. Attendre 5 secondes après l'entrée stable de l'univers.
3. Passer à l'univers suivant en 800 ms.
4. Boucler de Vimto vers le premier univers Tropicoul.
5. Suspendre la minuterie pendant une transition.
6. Suspendre au survol de la scène.
7. Suspendre lorsque le focus clavier entre dans le hero.
8. Suspendre temporairement lors d'une interaction tactile.
9. Suspendre lorsque `document.visibilityState !== "visible"`.
10. Suspendre lorsque moins de 55 % du hero est visible.
11. Reprendre après le délai prévu, sans sauter d'univers.
12. Ne jamais écouter `window.scrollY` pour choisir l'univers actif.

Utiliser `IntersectionObserver` pour la visibilité et `visibilitychange` pour l'onglet.

## 12. Transition entre les univers

La transition validée combine :

- sortie latérale du produit actif ;
- rotation légère du produit ;
- entrée du produit suivant depuis le côté opposé ;
- fondu ou morphing colorimétrique du fond ;
- disparition puis apparition progressive des assets ;
- aucune translation du texte ou des CTA.

Valeurs de départ :

```ts
const transition = {
  duration: 0.8,
  outgoingXPercent: -16,
  incomingXPercent: 16,
  outgoingRotation: -8,
  incomingRotation: 8,
  outgoingScale: 0.98,
  incomingScale: 0.98,
  ease: "power3.inOut",
};
```

L'amplitude peut être réduite sur mobile, mais la durée reste cohérente. Aucun flash blanc ou écran vide n'est accepté entre deux univers.

## 13. Contrôles et accessibilité

Aucun bouton précédent/suivant, pagination ou indicateur n'est visible en permanence.

Pour rendre le mouvement contrôlable sans modifier la direction visuelle :

- fournir un bouton pause/reprise dans le DOM ;
- le révéler uniquement avec `:focus-visible` ou après une interaction tactile dans le hero ;
- lui donner un libellé accessible explicite ;
- interrompre automatiquement le mouvement au survol et au focus ;
- ne pas utiliser `aria-live` pour annoncer chaque changement automatique ;
- considérer la scène comme décorative lorsque le contenu produit est disponible plus bas dans la page ;
- donner au canvas `aria-hidden="true"` et `role="presentation"` ;
- laisser le H1 et les CTA accessibles avant le chargement du JavaScript.

Avec `prefers-reduced-motion: reduce` :

- afficher le premier poster validé ;
- désactiver la rotation automatique ;
- ne pas charger Three.js ;
- ne pas animer les assets ;
- conserver le contenu et les CTA complets.

## 14. Chargement 3D

### Principe

Le poster est le rendu initial et le candidat LCP. Le canvas remplace visuellement le poster uniquement après chargement et validation du premier frame.

```text
HTML et texte
→ poster immédiat
→ détection WebGL / reduced motion / économie de données
→ import dynamique de Three.js
→ chargement du modèle actif
→ rendu du premier frame hors opacité
→ fondu poster vers canvas
```

### Contraintes

- Budget indicatif par modèle publié : 1 à 3 Mo après optimisation.
- Utiliser GLB/glTF compressé.
- Réutiliser une géométrie commune lorsque seul l'habillage change.
- Préférer le changement de texture à huit géométries identiques.
- Précharger uniquement le poster et, pendant une période inactive, le modèle suivant.
- Plafonner le ratio de pixels à 1.5 sur mobile et 2 sur desktop.
- Arrêter `requestAnimationFrame` hors écran.
- Libérer les textures inutilisées si la mémoire devient critique.
- Conserver le poster si le modèle échoue ou dépasse le délai de chargement.
- Ne pas charger la 3D lorsque `navigator.connection?.saveData === true`.

La rotation 3D au repos doit rester lente, environ un tour en 14 à 18 secondes. Elle ne remplace pas la transition de 800 ms entre univers.

## 15. Stratégie de médias

Structure attendue :

```text
public/media/mpm/hero/
├── tropicoul-ananas/
│   ├── poster.avif
│   ├── leaf-front.webp
│   ├── leaf-back.webp
│   └── fruit.webp
├── tropicoul-orange/
├── tropicoul-mangue/
├── tropicoul-goyave/
├── tropicoul-cocktail/
├── tropicoul-tamarin/
├── triplex/
└── vimto/

public/models/mpm/
├── can-standard.glb
├── triplex.glb
└── vimto.glb
```

Tous les posters doivent avoir un ratio et un cadrage compatibles avec desktop et mobile. Prévoir `object-position` par univers au lieu de recadrer automatiquement le visage principal du produit.

## 16. Comportement sans JavaScript ou sans WebGL

Le HTML rendu côté serveur doit déjà contenir :

- le surtitre ;
- le H1 ;
- l'introduction ;
- les deux CTA ;
- le premier poster Tropicoul.

Sans JavaScript, le hero reste complet et statique. Sans WebGL, la rotation automatique continue avec les posters et les assets 2D.

## 17. Analytique

Ne pas envoyer d'événement toutes les 5 secondes pour les changements automatiques.

Événements utiles :

```ts
type HeroAnalyticsEvent =
  | { name: "hero_partner_click"; locale: "fr" | "en" }
  | { name: "hero_products_click"; locale: "fr" | "en" }
  | { name: "hero_motion_paused"; source: "keyboard" | "touch" }
  | { name: "hero_3d_fallback"; reason: string };
```

Aucune donnée personnelle ne doit être attachée à ces événements.

## 18. Critères d'acceptation

### Fonctionnel

- [ ] Le hero affiche immédiatement le texte, les CTA et un poster.
- [ ] Tous les univers publiés tournent dans l'ordre configuré.
- [ ] Chaque saveur Tropicoul possède un univers distinct.
- [ ] Triplex et Vimto terminent la séquence.
- [ ] Le texte et les CTA ne changent jamais pendant la rotation.
- [ ] La transition dure 800 ms sans écran vide.
- [ ] Le cycle ne dépend jamais du scroll vertical.
- [ ] La page rejoint naturellement la section suivante.
- [ ] L'autoplay s'arrête hors écran et dans un onglet inactif.
- [ ] Le premier poster reste affiché en cas d'échec 3D.

### Responsive

- [ ] Desktop : texte à gauche, scène à droite.
- [ ] Mobile : scène en fond du hero.
- [ ] Les assets mobiles entourent le contenu sans masquer le texte.
- [ ] Aucun asset ne bloque un CTA.
- [ ] Aucun chevauchement à 360 x 800 et 390 x 844.
- [ ] Aucun scroll horizontal n'est créé.
- [ ] Le texte anglais complet reste lisible.

### Accessibilité

- [ ] Les CTA sont accessibles avant hydratation.
- [ ] Le focus reste visible.
- [ ] Le mouvement est contrôlable au clavier.
- [ ] `prefers-reduced-motion` produit une version statique complète.
- [ ] Le canvas et les assets décoratifs ne polluent pas le lecteur d'écran.
- [ ] Le contraste est vérifié pour chaque palette.

### Performance

- [ ] Le poster, et non le canvas, est le candidat LCP.
- [ ] Three.js est importé dynamiquement.
- [ ] Un seul canvas est actif.
- [ ] Le rendu s'arrête hors écran.
- [ ] Les dimensions des médias sont réservées avant chargement.
- [ ] Le hero reste utilisable en connexion lente et sur un téléphone Android réel.
- [ ] Aucun modèle individuel ne dépasse le budget validé.

## 19. Tests obligatoires

Viewports :

- 360 x 800
- 390 x 844
- 768 x 1024
- 1024 x 768
- 1440 x 900

Scénarios :

1. chargement normal ;
2. connexion lente ;
3. WebGL indisponible ;
4. économie de données active ;
5. réduction du mouvement active ;
6. onglet rendu inactif puis réactivé ;
7. scroll rapide vers la section suivante puis retour au hero ;
8. survol prolongé sur desktop ;
9. interaction tactile et scroll vertical sur mobile ;
10. échec d'un poster, d'un asset décoratif et d'un modèle 3D.

## 20. Éléments encore requis avant publication finale

- Posters hero définitifs pour les six saveurs Tropicoul.
- Poster et modèle validés pour Triplex.
- Assets, palette et poster officiels de Vimto.
- Modèle GLB pilote validé sur 360 degrés.
- Reconstruction fidèle des textures et logos des emballages.
- Validation des contrastes de chaque univers.
- Liens définitifs des CTA partenaire et produits.
- Validation finale des textes français et anglais.

Le développeur peut construire immédiatement le moteur, les transitions et les replis avec les posters provisoires. Aucun univers ne doit toutefois être considéré comme final tant que son pack de médias n'a pas été validé.
