export type Product = {
  slug: string;
  brand: "Tropicoul" | "Triplex";
  name: string;
  tags: readonly string[];
  headline: string;
  description: string;
  benefitTitle: string;
  benefit: string;
  image: string;
  packshot?: boolean;
  accent: string;
  deep: string;
  soft: string;
};

export const products: readonly Product[] = [
  {
    slug: "tropicoul-ananas",
    brand: "Tropicoul",
    name: "Ananas",
    tags: ["Solaire", "Fruitée", "Généreuse"],
    headline: "LE SOLEIL À CHAQUE GORGÉE.",
    description: "Une recette tropicale, fraîche et éclatante, pensée pour les moments qu’on a envie de prolonger.",
    benefitTitle: "UNE FRAÎCHEUR À PARTAGER",
    benefit: "L’ananas Tropicoul accompagne les pauses, les retrouvailles et les journées qui méritent une note de soleil.",
    image: "/media/simpara/tropicoul/ananas/ananas-hero.png",
    accent: "#f2b523",
    deep: "#195830",
    soft: "#fff6c9",
  },
  {
    slug: "tropicoul-mangue",
    brand: "Tropicoul",
    name: "Mangue",
    tags: ["Veloutée", "Tropicale", "Partage"],
    headline: "LA MANGUE QUI RASSEMBLE.",
    description: "Une saveur ronde et généreuse, avec toute la douceur d’un fruit que l’on reconnaît dès la première gorgée.",
    benefitTitle: "LE GOÛT DU MOMENT",
    benefit: "Tropicoul Mangue apporte une touche chaleureuse aux instants simples, entre énergie douce et plaisir immédiat.",
    image: "/media/simpara/tropicoul/mangue/mangue-hero.png",
    accent: "#ee842b",
    deep: "#6a2b13",
    soft: "#ffe1b2",
  },
  {
    slug: "tropicoul-orange",
    brand: "Tropicoul",
    name: "Orange",
    tags: ["Acidulée", "Vive", "Énergisante"],
    headline: "UN ÉCLAT D’ORANGE, SANS ATTENDRE.",
    description: "Une recette vive et fruitée pour réveiller les moments où l’on a envie d’aller de l’avant.",
    benefitTitle: "L’ÉLAN DU QUOTIDIEN",
    benefit: "Tropicoul Orange donne du relief aux pauses rapides, aux trajets et aux rendez-vous qui s’enchaînent.",
    image: "/media/simpara/tropicoul/orange/orange-card.png",
    accent: "#f26e24",
    deep: "#7a2808",
    soft: "#ffe0ad",
  },
  {
    slug: "tropicoul-goyave",
    brand: "Tropicoul",
    name: "Goyave",
    tags: ["Douce", "Singulière", "Exotique"],
    headline: "UNE DOUCEUR QUI RESTE EN TÊTE.",
    description: "La goyave Tropicoul révèle une personnalité délicate, pour celles et ceux qui aiment sortir des sentiers battus.",
    benefitTitle: "UNE SAVEUR À PART",
    benefit: "Sa fraîcheur douce transforme un moment ordinaire en une parenthèse inattendue, à savourer sans se presser.",
    image: "/media/mpm/hero/tropicoul-goyave/poster.png",
    packshot: true,
    accent: "#e65074",
    deep: "#8e1744",
    soft: "#ffd5df",
  },
  {
    slug: "tropicoul-cocktail",
    brand: "Tropicoul",
    name: "Cocktail",
    tags: ["Mélange", "Colorée", "Festive"],
    headline: "PLUSIEURS FRUITS. UN SEUL ÉLAN.",
    description: "Un assemblage joyeux de saveurs tropicales pour tous les moments que l’on préfère vivre ensemble.",
    benefitTitle: "LE PARTAGE EN GRAND",
    benefit: "Tropicoul Cocktail fait entrer la couleur et l’enthousiasme dans les rencontres du quotidien.",
    image: "/media/simpara/tropicoul/cocktail/cocktail-card.png",
    accent: "#a5ba4d",
    deep: "#31582d",
    soft: "#edf0bd",
  },
  {
    slug: "tropicoul-tamarin",
    brand: "Tropicoul",
    name: "Tamarin",
    tags: ["Intense", "Locale", "Authentique"],
    headline: "L’INTENSITÉ QUI A DU CARACTÈRE.",
    description: "Une saveur franche et profonde, inspirée des goûts qui font partie de nos repères.",
    benefitTitle: "UN GOÛT BIEN À LUI",
    benefit: "Tropicoul Tamarin offre une parenthèse de caractère, idéale quand on recherche une signature plus intense.",
    image: "/media/simpara/tropicoul/tamarin/tamarin-card.png",
    accent: "#846243",
    deep: "#43281b",
    soft: "#eadac5",
  },
  {
    slug: "triplex-original",
    brand: "Triplex",
    name: "Original",
    tags: ["Intense", "Rythmée", "Déterminée"],
    headline: "L’ÉNERGIE QUI TIENT LE RYTHME.",
    description: "Triplex accompagne les journées engagées avec une énergie affirmée et une attitude sans compromis.",
    benefitTitle: "PRÊT POUR LE PROCHAIN DÉFI",
    benefit: "Quand la cadence s’accélère, Triplex reste au rendez-vous pour garder le cap et poursuivre l’effort.",
    image: "/media/simpara/triplex/triplex-hero.png",
    accent: "#d43f2c",
    deep: "#421412",
    soft: "#ffd3ca",
  },
];

export function findProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
