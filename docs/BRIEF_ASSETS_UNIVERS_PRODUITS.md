# Brief de production — univers visuels des produits Multiproduit Mali

## Objectif

Chaque produit doit posséder un univers immédiatement reconnaissable dans le Hero et sur sa fiche produit. La canette 3D reste la référence centrale. Les nouveaux visuels servent uniquement de décor, répartis en profondeur autour du produit et derrière les textes.

Les fichiers décoratifs ne doivent contenir ni canette, ni logo, ni mot, ni emballage inventé. Les textes et les marques restent gérés par le site afin de garantir leur netteté et leur exactitude.

## Direction générale

- Composition immersive sur toute la surface du Hero, sans carte ni rectangle autour de la canette.
- Canette placée entre les couches de décor et derrière le texte principal.
- Trois plans visuels minimum : arrière-plan, éléments intermédiaires, premier plan.
- Lumière cohérente : éclairage principal venant du haut-gauche, léger contre-jour sur les contours.
- Détourage propre avec 10 à 15 % de marge autour des objets.
- Aucun bord coupé, halo blanc, faux texte ou ombre rectangulaire.
- Ombres douces séparées du sujet lorsque cela facilite l'intégration.
- Prévoir une composition desktop horizontale et une composition mobile verticale.
- Le tiers gauche du desktop doit rester suffisamment calme pour les textes. Des éléments peuvent passer derrière les lettres, mais jamais réduire leur contraste.
- En mobile, le centre-gauche reste réservé au titre et aux CTA ; les éléments principaux se concentrent à droite, en haut et en bas.

## Formats de livraison

| Asset | Master demandé | Export web principal | Export de secours | Poids cible |
| --- | --- | --- | --- | --- |
| Fond Hero desktop | 2880 × 1800 px, PNG ou TIFF | AVIF 2880 × 1800 | WebP 2560 × 1600 | 250–450 Ko |
| Fond Hero mobile | 1440 × 1920 px, PNG ou TIFF | AVIF 1440 × 1920 | WebP 1200 × 1600 | 180–350 Ko |
| Fond fiche desktop | 2880 × 1800 px | AVIF 2880 × 1800 | WebP 2560 × 1600 | 300–500 Ko |
| Fond fiche mobile | 1440 × 1920 px | AVIF 1440 × 1920 | WebP 1200 × 1600 | 200–400 Ko |
| Gros fruit ou feuillage premier plan | PNG transparent 2400 × 2400 px | AVIF alpha ou WebP alpha 1600–2000 px | PNG transparent | 120–350 Ko |
| Fruit entier, demi-fruit ou grappe | PNG transparent 1800 × 1800 px | AVIF/WebP alpha 1200–1600 px | PNG transparent | 80–250 Ko |
| Morceaux individuels | PNG transparent 1200 × 1200 px par élément | WebP alpha 800–1200 px | PNG transparent | 30–120 Ko |
| Éclaboussure ou ruban liquide | PNG transparent 2400 × 1800 px | AVIF/WebP alpha 1800–2200 px | PNG transparent | 120–350 Ko |
| Particules, bulles ou gouttes | PNG transparent 2048 × 2048 px | WebP alpha 1536–2048 px | PNG transparent | 70–220 Ko |
| Brume, lumière ou bokeh | PNG transparent 2048 × 1536 px | AVIF/WebP alpha | PNG transparent | 60–180 Ko |
| Texture répétable | PNG 2048 × 2048 px | AVIF/WebP 2048 × 2048 px | PNG | 100–300 Ko |
| Photo lifestyle | JPG ou TIFF 3000 px minimum | AVIF 2400 × 1600 px | WebP/JPG 2000 × 1333 px | 250–600 Ko |
| Élément vectoriel abstrait | SVG propre, sans image intégrée | SVG | PNG si nécessaire | moins de 80 Ko |

Conserver les masters non compressés dans un dossier source distinct. Le développeur recevra les exports AVIF/WebP/PNG et ne modifiera pas les fichiers maîtres.

## Convention de nommage

Utiliser uniquement des minuscules, des tirets et un numéro de version :

`<produit>-<role>-<profondeur>-v01.<extension>`

Exemples :

- `ananas-morceaux-mid-v01.webp`
- `goyave-demi-fruit-front-v01.avif`
- `triplex-etincelles-front-v01.webp`
- `vimto-fond-hero-mobile-v01.avif`

Rôles recommandés : `background`, `atmosphere`, `fruit`, `leaf`, `splash`, `particle`, `foreground`, `texture`, `lifestyle`.

## Pack commun à produire pour chaque produit

Pour chacun des huit produits, livrer au minimum :

1. Un fond Hero desktop sans texte et sans canette.
2. Un fond Hero mobile séparé, recomposé pour le portrait.
3. Un fond de fiche produit desktop.
4. Un fond de fiche produit mobile.
5. Un élément botanique ou graphique arrière-plan.
6. Un groupe principal de fruits ou d'éléments identitaires en plan intermédiaire.
7. Trois à six éléments détourés individuels permettant au développeur de varier la composition.
8. Un élément de premier plan volontairement recadrable.
9. Une éclaboussure, un ruban liquide ou un effet énergétique transparent.
10. Une couche de particules, gouttes, bulles ou poussières.
11. Une couche d'atmosphère légère : brume, halo ou bokeh.
12. Une photo lifestyle horizontale sans texte.

## Tropicoul Ananas

### Ambiance

Soleil tropical, fraîcheur jaune-or, végétation verte et lumière chaude. Le résultat doit être généreux et lumineux, sans devenir enfantin.

### Éléments nécessaires

- Fond dégradé jaune solaire vers orange ambré, avec une zone plus sombre derrière le texte blanc si nécessaire.
- Silhouette douce de végétation tropicale en arrière-plan.
- Un ananas entier avec couronne, détouré, plan intermédiaire.
- Un demi-ananas révélant la chair et les fibres.
- Cinq à sept morceaux d'ananas irréguliers, séparés les uns des autres.
- Deux rondelles fines et une tranche triangulaire.
- Deux variantes de feuilles d'ananas et une feuille de palmier.
- Une éclaboussure de jus jaune translucide formant un arc autour de la canette.
- Un lot de gouttes, microgouttes et fibres lumineuses.
- Un gros morceau flou ou légèrement hors focus pour le premier plan.
- Une brume dorée et quelques reflets de soleil.
- Photo lifestyle : partage en extérieur, lumière de fin d'après-midi, dominante jaune-verte.

### Placement conseillé

Morceaux moyens autour du tiers droit, une grande feuille en haut-droite, quelques morceaux passant derrière le titre, grosse tranche en bas-droite au premier plan.

## Tropicoul Orange

### Ambiance

Énergie vive, agrumes frais, lumière franche et contrastes orange-corail.

### Éléments nécessaires

- Fond orange lumineux vers rouge-corail avec halo central.
- Texture très légère de pulpe ou peau d'orange, sans répétition visible.
- Deux oranges entières avec feuilles.
- Deux demi-oranges juteuses vues de trois-quarts.
- Quatre rondelles transparentes ou semi-transparentes.
- Un long ruban de zeste spiralé.
- Trois feuilles d'oranger et quelques fleurs blanches discrètes.
- Éclaboussure de jus orange, plus vive et plus nerveuse que celle de l'ananas.
- Particules de pulpe, gouttes et condensation.
- Une demi-orange macro au premier plan.
- Reflets solaires courts et bokeh chaud.
- Photo lifestyle : mouvement urbain ou pause dynamique, lumière matinale.

### Placement conseillé

Ruban de zeste traversant le fond derrière la canette, rondelles réparties en diagonale, demi-orange macro dans un angle inférieur.

## Tropicoul Mangue

### Ambiance

Chaleur veloutée, douceur tropicale, tons jaune safran, orange et vert profond.

### Éléments nécessaires

- Fond safran vers orange brûlé, avec lumière diffuse et texture douce.
- Deux mangues entières de couleurs légèrement différentes.
- Une demi-mangue quadrillée en hérisson.
- Six cubes ou lamelles de mangue séparés.
- Deux feuilles de manguier avec nervures visibles.
- Branche légère de manguier en arrière-plan.
- Ruban de nectar épais, plus crémeux que l'éclaboussure d'orange.
- Petites gouttes ambrées et particules lumineuses.
- Macro de chair de mangue au premier plan.
- Halo chaud, poussière solaire et ombre végétale douce.
- Photo lifestyle : moment convivial et chaleureux, tons dorés.

### Placement conseillé

Demi-mangue derrière le bas de la canette, cubes en suspension autour de l'épaule de la canette, feuilles orientées vers le texte.

## Tropicoul Goyave

### Ambiance

Exotisme délicat, rose chair, vert feuille, fraîcheur douce et lumière légèrement nacrée.

### Éléments nécessaires

- Fond rose goyave vers framboise, avec nuances vertes très contrôlées.
- Deux goyaves entières vert-jaune.
- Deux demi-goyaves roses avec graines nettes.
- Quatre quartiers séparés, dont un macro.
- Plusieurs feuilles de goyavier et une petite branche.
- Éclaboussure rose translucide.
- Graines, gouttelettes et fines particules rosées.
- Brume claire et halo nacré.
- Une feuille ou un demi-fruit au premier plan.
- Photo lifestyle : ambiance calme, fraîche et premium, lumière douce.

### Placement conseillé

Demi-goyave principale près du centre-droit, graines et gouttes devant le fond, feuilles en cadre dans les coins.

## Tropicoul Cocktail

### Ambiance

Mélange festif et tropical, riche mais organisé. L'univers doit rester plus sophistiqué qu'un collage multicolore.

### Éléments nécessaires

- Fond vert tropical vers jaune chaud avec touches corail.
- Groupe maître de fruits mêlant ananas, orange, mangue et goyave.
- Un élément entier et un morceau détouré de chaque fruit.
- Deux éventails de feuilles tropicales différents.
- Une éclaboussure multicolore cohérente, dominée par le jaune/orange.
- Gouttes, bulles et microfragments de fruits.
- Rubans colorés abstraits très discrets, sans confettis de fête génériques.
- Gros fruit recadrable au premier plan.
- Bokeh tropical et lumière festive.
- Photo lifestyle : groupe d'amis ou famille, table colorée, extérieur lumineux.

### Placement conseillé

Cluster de fruits derrière et sous la canette, quelques morceaux répartis vers le texte, feuillages formant une arche ouverte.

## Tropicoul Tamarin

### Ambiance

Caractère local, profondeur végétale, brun ambré, vert forêt et chaleur sahélienne.

### Éléments nécessaires

- Fond vert forêt vers brun terre ou ambre sombre.
- Trois gousses de tamarin entières.
- Deux gousses ouvertes montrant la pulpe.
- Pulpe et graines séparées, sans aspect desséché excessif.
- Deux branches de feuilles fines de tamarinier.
- Ruban de boisson ambrée et dense.
- Gouttes brun doré, poussières lumineuses et petites particules naturelles.
- Ombres de feuillage et chaleur atmosphérique très légère.
- Gousse macro au premier plan.
- Texture de terre ou fibre végétale extrêmement subtile.
- Photo lifestyle : moment authentique, lumière chaude, matière naturelle et contexte malien contemporain.

### Placement conseillé

Branches fines en hauteur, gousses ouvertes près de la canette, ruban ambré traversant le fond sans passer devant le texte.

## Triplex Original

### Ambiance

Puissance noire et rouge, vitesse, tension électrique et contraste premium. Le fond principal doit être noir profond, jamais gris clair.

### Éléments nécessaires

- Fond noir `#050505` vers charbon `#121212`, avec zone rouge sombre derrière la canette.
- Halo rouge contrôlé et lueur blanche froide sur les arêtes.
- Deux rubans d'énergie rouges, séparés, utilisables en arrière et premier plan.
- Étincelles rouges et blanches sur fond transparent.
- Microfragments ou éclats minéraux noirs, sans verre dangereux ni scène d'explosion.
- Une fumée sombre légère avec liseré rouge.
- Traits de vitesse et vibrations graphiques en SVG ou PNG transparent.
- Condensation froide et fines gouttes.
- Surface noire réfléchissante ou ombre au sol séparée.
- Motif technique/carbone très subtil et répétable.
- Photo lifestyle : sport urbain, musique ou effort nocturne, éclairage rouge et noir, attitude énergique sans allégation médicale.

### Placement conseillé

Canette fortement détachée par un rim light rouge et blanc, énergie circulaire derrière elle, étincelles au premier plan. Conserver le côté gauche suffisamment sombre et calme pour le titre.

## Vimto Sparkling

### Ambiance

Univers iconique rouge-bordeaux, fruité, pétillant et légèrement nocturne. La composition fruitée s'appuie sur raisin, cassis et framboise.

### Éléments nécessaires

- Fond bordeaux profond vers rouge rubis avec reflets dorés discrets.
- Grappe de raisin rouge ou noir détourée.
- Cassis en petit groupe et baies individuelles.
- Framboises entières et une demi-framboise macro.
- Quelques feuilles de vigne ou feuilles de fruits rouges.
- Ruban liquide rubis translucide.
- Bulles de gaz, condensation et gouttes rouges transparentes.
- Halo rose-rouge et bokeh de célébration.
- Éclat doré très fin rappelant les contours de l'identité, sans reproduire le logo.
- Grappe ou fruit macro au premier plan.
- Photo lifestyle : célébration élégante ou repas partagé, lumière bordeaux et dorée.

### Placement conseillé

Grappe derrière le bas de la canette, baies et bulles autour de la partie haute, ruban rubis en arc. Éviter de surcharger l'étiquette rouge.

La sélection raisin, cassis et framboise correspond au mélange de fruits communiqué pour Vimto Original Fizzy par la marque. Vérifier néanmoins l'étiquette réglementaire du produit commercialisé au Mali avant de faire une allégation textuelle sur le site.

## Assets partagés facultatifs

- Deux feuilles de palmier différentes : une nette et une légèrement floue.
- Une ombre elliptique au sol, neutre, transparente.
- Une couche de condensation neutre adaptable aux huit canettes.
- Une couche de microbulles.
- Deux halos lumineux neutres, chaud et froid.
- Un grain photographique très léger, transparent et répétable.
- Une brume basse neutre.

Ces éléments partagés ne doivent jamais rendre les univers identiques. Ils servent seulement à harmoniser la qualité et la profondeur.

## Prompt type pour ChatGPT Image

Adapter les mots entre crochets :

> Crée un asset photographique premium isolé de [élément], destiné à un Hero de site de boisson. Vue trois-quarts, lumière principale venant du haut-gauche, léger contre-jour, texture réaliste, fraîcheur et condensation maîtrisées. Fond entièrement transparent avec canal alpha propre, aucun texte, aucun logo, aucune canette, aucun emballage, aucun cadre, aucun bord coupé, aucune ombre rectangulaire. Sujet centré avec 15 % de marge. Résolution 2400 × 2400 px.

Pour les fonds :

> Crée un arrière-plan photographique premium 2880 × 1800 px pour l'univers [produit]. Palette [couleurs], profondeur cinématographique, lumière principale haut-gauche, centre-droit plus expressif pour accueillir une canette, tiers gauche plus calme et contrasté pour du texte blanc/noir. Aucun texte, aucun logo, aucune canette, aucun emballage, aucune bordure ni carte. Le décor doit remplir toute l'image.

## Contrôle qualité avant remise au développeur

- Le canal alpha est réellement transparent, pas noir ou blanc.
- Aucun faux logo, texte ou emballage n'apparaît.
- Les fruits correspondent à la bonne espèce et présentent une texture réaliste.
- Les objets possèdent une marge suffisante pour être animés.
- Les variantes desktop et mobile ne sont pas de simples recadrages destructifs.
- La direction de lumière reste cohérente entre tous les éléments d'un même univers.
- Les premiers plans sont plus gros et plus contrastés que les arrière-plans.
- Les fichiers respectent le nommage et les dimensions demandées.
- Le poids web est vérifié après export.
- Les masters non compressés restent archivés séparément.
