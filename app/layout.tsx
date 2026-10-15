import type { Metadata } from "next";
import "./globals.css";
import { organizationSchema, SITE_ORIGIN } from "./site-seo";

const title = "Multiproduit Mali | Tropicoul, Triplex et Vimto";
const description = "Découvrez les boissons Tropicoul, Triplex Energy Drink et Vimto Sparkling dans l’univers Multiproduit Mali : produits, identités visuelles et contacts commerciaux.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title,
  description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title,
    description,
    siteName: "Multiproduit Mali",
    type: "website",
    locale: "fr_FR",
    images: [{ url: "/og.png", width: 1734, height: 908, alt: "Multiproduit Mali" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <a className="skip-link" href="#main-content">Aller au contenu principal</a>
        {children}
      </body>
    </html>
  );
}
