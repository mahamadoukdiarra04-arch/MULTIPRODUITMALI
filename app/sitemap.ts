import type { MetadataRoute } from "next";

import { products } from "./products";
import { SITE_ORIGIN } from "./site-seo";

const corePages = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" as const },
  { path: "/livraison", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/actualites", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/gammes/tropicoul", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/gammes/vimto", priority: 0.8, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = corePages.map(({ path, ...details }) => ({
    url: `${SITE_ORIGIN}${path}`,
    ...details,
  }));

  const publicProducts = products.filter((product) => product.publicationStatus === "published");

  return [
    ...pages,
    ...publicProducts.flatMap((product) => [
      {
        url: `${SITE_ORIGIN}/produits/${product.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      {
        url: `${SITE_ORIGIN}/produits/${product.slug}/univers`,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
    ]),
  ];
}
