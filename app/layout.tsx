import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const siteUrl = `${protocol}://${host}`;
  const title = "Multiproduit Mali | Tropicoul, Triplex et Vimto";
  const description = "Découvrez Tropicoul, Triplex Original et Vimto Sparkling dans l’univers Multiproduit Mali : produits, identités visuelles et contacts commerciaux.";

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main-content">Aller au contenu principal</a>
        {children}
      </body>
    </html>
  );
}
