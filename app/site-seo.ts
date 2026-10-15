export const SITE_ORIGIN = "https://multiproduitmali.ml";

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_ORIGIN}/#website`,
  name: "Multiproduit Mali",
  alternateName: "Multiproduit Mali SARL",
  url: `${SITE_ORIGIN}/`,
  inLanguage: "fr",
  publisher: { "@id": `${SITE_ORIGIN}/#organization` },
} as const;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_ORIGIN}/#organization`,
  name: "Multiproduit Mali",
  alternateName: "Multiproduit Mali SARL",
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/media/mpm/brand/multiproduit-mali-logo-192.webp`,
  email: "multiproduitmali@gmail.com",
  telephone: "+223 76 41 43 49",
  areaServed: { "@type": "Country", name: "Mali" },
  hasMap: "https://share.google/WSOIbEkudPOsWalCF",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+223 76 41 43 49",
    email: "multiproduitmali@gmail.com",
    contactType: "customer service",
    availableLanguage: ["French"],
  },
  brand: ["Tropicoul", "Triplex", "Vimto"].map((name) => ({ "@type": "Brand", name })),
  sameAs: [
    "https://www.facebook.com/share/1BkVFeKfJ9/",
    "https://www.tiktok.com/@triplex.mali?_r=1&_t=ZN-99vMifRheHW",
    "https://www.facebook.com/share/p/19nAASMHVk/",
  ],
} as const;
