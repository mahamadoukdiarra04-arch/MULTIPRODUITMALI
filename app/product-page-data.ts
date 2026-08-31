export type ProductPagePoster = {
  desktop: { width: 2560; height: 1440; avifSrcSet: string; webpSrcSet: string; fallback: string };
  mobile: { width: 1440; height: 1920; avifSrcSet: string; webpSrcSet: string };
};

export type ProductPageContent = {
  metaDescription: string;
  heroLead: string;
  signatureEyebrow: string;
  signatureTitle: string;
  signatureCopy: string;
  productTitle: string;
  productCopy: string;
  macroTitle: string;
  macroCopy: string;
  lifestyleTitle: string;
  lifestyleCopy: string;
  heroLayerIds: readonly string[];
  macroAssetId: string;
  showLifestyle: boolean;
};

const desktopWidths = [640, 960, 1280, 1600, 1920] as const;
const mobileWidths = [360, 480, 720, 1000, 1440] as const;

function createSrcSet(slug: string, role: "desktop" | "mobile", format: "avif" | "webp") {
  const widths = role === "desktop" ? desktopWidths : mobileWidths;
  return widths
    .map((width) => `/media/mpm/product-pages/${slug}/images/${slug}__hero-${role}__${width}w.${format} ${width}w`)
    .join(", ");
}

export function createProductPagePoster(slug: string): ProductPagePoster {
  return {
    desktop: {
      width: 2560,
      height: 1440,
      avifSrcSet: createSrcSet(slug, "desktop", "avif"),
      webpSrcSet: createSrcSet(slug, "desktop", "webp"),
      fallback: `/media/mpm/product-pages/${slug}/images/${slug}__hero-desktop__1280w.webp`,
    },
    mobile: {
      width: 1440,
      height: 1920,
      avifSrcSet: createSrcSet(slug, "mobile", "avif"),
      webpSrcSet: createSrcSet(slug, "mobile", "webp"),
    },
  };
}

export const productPageContent: Readonly<Record<string, ProductPageContent>> = {
  "tropicoul-ananas": {
    metaDescription: "Tropicoul Ananas 330 ml : une boisson fruitée à l’ananas, lumineuse et généreuse, pour les pauses fraîches et les moments à partager.",
    heroLead: "Tropicoul Ananas met l’ananas au premier plan dans une canette 330 ml pleine de soleil. Une saveur fruitée, fraîche et généreuse pour donner du goût aux pauses comme aux moments de partage.",
    signatureEyebrow: "L’ananas en grand",
    signatureTitle: "Le soleil s’ouvre en canette.",
    signatureCopy: "Jaune éclatant, vert tropical et goût d’ananas : Tropicoul Ananas annonce la couleur dès le premier regard et prolonge l’évasion à chaque gorgée.",
    productTitle: "Le goût du soleil à portée de main.",
    productCopy: "Son format 330 ml se glisse naturellement dans les pauses, les repas et les virées. Une canette fruitée, facile à aimer quand l’envie d’ananas se fait sentir.",
    macroTitle: "Toute la fraîcheur de l’ananas.",
    macroCopy: "L’ananas, le feuillage et les éclats de lumière racontent une saveur généreuse. Une identité vive qui donne immédiatement envie d’ouvrir la canette.",
    lifestyleTitle: "Une saveur qui rassemble.",
    lifestyleCopy: "Bien fraîche, Tropicoul Ananas accompagne les conversations qui durent, les repas animés et toutes les petites occasions de se retrouver.",
    heroLayerIds: ["ananas-atmosphere-back-v01", "ananas-particle-front-v01"],
    macroAssetId: "ananas-fruit-cluster-mid-v01",
    showLifestyle: true,
  },
  "tropicoul-mangue": {
    metaDescription: "Tropicoul Mangue 330 ml : une boisson fruitée à la mangue, douce et généreuse, à savourer bien fraîche à tout moment.",
    heroLead: "Tropicoul Mangue célèbre la rondeur et la générosité de la mangue dans une canette 330 ml. Une saveur dorée, douce et fruitée qui transforme une simple pause en vrai moment de plaisir.",
    signatureEyebrow: "La mangue sans détour",
    signatureTitle: "Un goût généreux qui donne envie de revenir.",
    signatureCopy: "Tropicoul Mangue offre une parenthèse fruitée et chaleureuse, portée par une saveur familière que l’on a plaisir à retrouver bien fraîche.",
    productTitle: "La mangue, simplement irrésistible.",
    productCopy: "Une canette 330 ml pour savourer un goût de mangue franc et généreux, au repas, en déplacement ou dès que l’envie d’une pause fruitée arrive.",
    macroTitle: "Une mangue qui se voit, un goût qui reste.",
    macroCopy: "Les tons dorés prolongent la promesse de la canette : une saveur ample, solaire et gourmande, prête à se partager.",
    lifestyleTitle: "Le goût des bons moments.",
    lifestyleCopy: "Autour d’une table, sur le chemin ou entre amis, Tropicoul Mangue met une note douce et fruitée dans les instants simples.",
    heroLayerIds: ["mangue-atmosphere-back-v01", "mangue-nectar-ribbon-mid-v01"],
    macroAssetId: "mangue-fruit-cluster-mid-v01",
    showLifestyle: true,
  },
  "tropicoul-orange": {
    metaDescription: "Tropicoul Orange 330 ml : une boisson fruitée à l’orange, vive et ensoleillée, pour mettre du pep’s dans les pauses du quotidien.",
    heroLead: "Tropicoul Orange apporte un goût d’orange vif et ensoleillé dans une canette 330 ml. Une saveur franche qui réveille les envies de fraîcheur, à savourer quand la journée réclame un peu de couleur.",
    signatureEyebrow: "L’orange qui réveille",
    signatureTitle: "Une gorgée vive. Une envie immédiate.",
    signatureCopy: "Avec son goût d’orange éclatant, Tropicoul Orange apporte une note fraîche et pétillante aux pauses qui n’attendent pas.",
    productTitle: "L’orange qui met du rythme dans la journée.",
    productCopy: "Son format 330 ml suit les journées actives, les repas sur le pouce et les moments entre amis avec une saveur orange simple, fraîche et expressive.",
    macroTitle: "Toute la vivacité de l’orange.",
    macroCopy: "La couleur, les tranches et les éclats lumineux traduisent une seule envie : ouvrir une canette bien fraîche et profiter d’un vrai goût d’orange.",
    lifestyleTitle: "À partager sans attendre.",
    lifestyleCopy: "Tropicoul Orange apporte sa note ensoleillée aux discussions, aux sorties et aux pauses qui deviennent vite de bons souvenirs.",
    heroLayerIds: ["orange-atmosphere-back-v01", "orange-rings-set-mid-v01"],
    macroAssetId: "orange-splash-mid-v01",
    showLifestyle: true,
  },
  "tropicoul-goyave": {
    metaDescription: "Tropicoul Goyave 330 ml : une boisson fruitée à la goyave, fraîche et singulière, pour celles et ceux qui aiment découvrir de nouvelles saveurs.",
    heroLead: "Tropicoul Goyave révèle une saveur fruitée plus inattendue dans une canette 330 ml. Une pause fraîche, douce et pleine de caractère pour sortir des choix habituels.",
    signatureEyebrow: "La goyave sort du cadre",
    signatureTitle: "Une saveur à découvrir, puis à redemander.",
    signatureCopy: "Tropicoul Goyave mêle fraîcheur et originalité dans une canette qui invite à faire une place à la découverte.",
    productTitle: "La goyave qui change la routine.",
    productCopy: "Son format 330 ml accompagne naturellement les envies de nouveauté. Une saveur fruitée et singulière pour les pauses qui méritent de surprendre.",
    macroTitle: "Le goût de la découverte.",
    macroCopy: "La chair rose, les graines et le feuillage prolongent la promesse de Tropicoul Goyave : une saveur généreuse, originale et résolument fruitée.",
    lifestyleTitle: "Quand l’envie de nouveauté se partage.",
    lifestyleCopy: "Tropicoul Goyave donne une touche plus inattendue aux repas, aux échanges et aux moments où l’on aime faire découvrir une nouvelle saveur.",
    heroLayerIds: ["goyave-atmosphere-product-v01", "goyave-leaf-background-back-v01"],
    macroAssetId: "goyave-quarter-front-product-v01",
    showLifestyle: true,
  },
  "tropicoul-cocktail": {
    metaDescription: "Tropicoul Cocktail 330 ml : une boisson fruitée au goût cocktail, fraîche et expressive, faite pour les moments qui ont envie de bouger.",
    heroLead: "Tropicoul Cocktail rassemble une palette de saveurs fruitées dans une canette 330 ml pleine d’élan. Une boisson fraîche et expressive pour donner une tonalité plus festive aux pauses et aux retrouvailles.",
    signatureEyebrow: "Le goût de la fête",
    signatureTitle: "Plus de fruits. Plus de plaisir.",
    signatureCopy: "Tropicoul Cocktail joue la carte d’un goût fruité généreux, celui qui invite naturellement à lever les verres et à prolonger le moment.",
    productTitle: "Une canette pour les moments qui bougent.",
    productCopy: "Bien fraîche, Tropicoul Cocktail suit les sorties, les discussions animées et les envies de partager une boisson au goût fruité et joyeux.",
    macroTitle: "Un cocktail de saveurs à ouvrir bien frais.",
    macroCopy: "Les éclats de couleur et de lumière reflètent une promesse simple : une canette expressive, une saveur fruitée et le plaisir de la découverte.",
    lifestyleTitle: "La note fruitée des bons moments.",
    lifestyleCopy: "Tropicoul Cocktail se savoure quand l’ambiance monte, que les amis sont là et que l’on a envie d’ajouter une note fraîche à l’instant.",
    heroLayerIds: ["cocktail-atmosphere-back-v01", "cocktail-ribbon-back-v01"],
    macroAssetId: "cocktail-ribbon-back-v01",
    showLifestyle: true,
  },
  "tropicoul-tamarin": {
    metaDescription: "Tropicoul Tamarin 330 ml : une boisson fruitée au tamarin, profonde et singulière, pour les palais qui aiment les saveurs de caractère.",
    heroLead: "Tropicoul Tamarin fait découvrir le caractère profond et singulier du tamarin dans une canette 330 ml. Une saveur fruitée qui change des habitudes et laisse une impression durable.",
    signatureEyebrow: "Le tamarin, sans compromis",
    signatureTitle: "Un goût de caractère pour les curieux.",
    signatureCopy: "Tropicoul Tamarin offre une autre façon de choisir une boisson fruitée : plus profonde, plus singulière et toujours prête à se savourer bien fraîche.",
    productTitle: "Une saveur qui ne ressemble à aucune autre.",
    productCopy: "Son format 330 ml fait de chaque pause une occasion de découvrir le tamarin. Une canette pour celles et ceux qui recherchent un goût fruité avec plus de personnalité.",
    macroTitle: "Le caractère du tamarin, jusqu’au détail.",
    macroCopy: "Les gousses et les nuances ambrées racontent une saveur profonde et chaleureuse, celle qui donne à Tropicoul Tamarin sa différence.",
    lifestyleTitle: "Pour changer la conversation autour de la table.",
    lifestyleCopy: "Tropicoul Tamarin s’invite dans les moments partagés avec un goût singulier qui étonne, se commente et donne envie d’être découvert.",
    heroLayerIds: ["tamarin-atmosphere-back-v01", "tamarin-amber-ribbon-mid-v01"],
    macroAssetId: "tamarin-open-pod-mid-v01",
    showLifestyle: true,
  },
  "triplex-original": {
    metaDescription: "Triplex Original 330 ml : une boisson énergisante au goût intense, conçue pour accompagner les journées rapides et les nuits qui se prolongent.",
    heroLead: "Triplex Original est une boisson énergisante 330 ml au goût intense et au caractère assumé. Quand le rythme s’accélère ou que la soirée commence à peine, Triplex est la canette qui reste dans le mouvement.",
    signatureEyebrow: "L’énergie du moment",
    signatureTitle: "Triplex. Gardez le rythme.",
    signatureCopy: "Une canette noire, un goût intense, une énergie affirmée : Triplex Original accompagne les moments qui demandent de rester dans le jeu.",
    productTitle: "L’énergie se choisit froide.",
    productCopy: "Compacte et prête à suivre le mouvement, Triplex Original se savoure bien fraîche quand la journée file, que la route s’allonge ou que la nuit promet encore beaucoup.",
    macroTitle: "Un goût intense. Une énergie assumée.",
    macroCopy: "Chaque détail de Triplex annonce une boisson énergisante sans détour : une identité forte, une canette qui marque et un goût prêt à accompagner les grands rythmes.",
    lifestyleTitle: "Quand la nuit ne fait que commencer.",
    lifestyleCopy: "Triplex Original trouve sa place dans les soirées, les sorties et tous les instants où l’on veut garder le tempo et profiter du moment jusqu’au bout.",
    heroLayerIds: ["triplex-atmosphere-product-v01", "triplex-energy-ribbon-product-v01"],
    macroAssetId: "triplex-carbon-product-v01",
    showLifestyle: true,
  },
  "vimto-sparkling": {
    metaDescription: "Vimto Sparkling 330 ml : une boisson fruitée pétillante au goût emblématique, faite pour rafraîchir les moments à partager.",
    heroLead: "Vimto Sparkling associe un goût fruité pétillant à une canette rouge devenue emblématique. Une boisson 330 ml pleine de caractère, faite pour les repas qui s’éternisent, les retrouvailles et les moments tout simples.",
    signatureEyebrow: "Un goût qui rassemble",
    signatureTitle: "Vimto. Une gorgée, et le moment prend une autre couleur.",
    signatureCopy: "Fruitée, pétillante et immédiatement reconnaissable, Vimto Sparkling apporte une note de fraîcheur à chaque moment partagé.",
    productTitle: "Une canette emblématique, un goût à partager.",
    productCopy: "Son format 330 ml se savoure bien frais à table, entre amis ou pendant une pause. Vimto Sparkling, c’est une boisson fruitée pétillante qui donne envie de prolonger l’instant.",
    macroTitle: "Le goût Vimto, au premier regard.",
    macroCopy: "Le rouge, le jaune et le panneau blanc annoncent une saveur fruitée pétillante au caractère unique. Une identité reconnaissable qui fait partie du plaisir dès l’ouverture.",
    lifestyleTitle: "La fraîcheur des moments partagés.",
    lifestyleCopy: "Vimto Sparkling est à sa place autour d’un repas, d’une discussion animée ou d’une grande tablée : une canette fraîche pour rendre chaque instant plus savoureux.",
    heroLayerIds: ["vimto-red-liquid-ribbon-mid-v02", "vimto-bubble-particle-front-v02"],
    macroAssetId: "vimto-red-liquid-ribbon-mid-v02",
    showLifestyle: true,
  },
};
