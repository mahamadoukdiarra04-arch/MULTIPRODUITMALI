import type { Metadata } from "next";
import Link from "../PlainLink";

import { BrandLogo } from "../BrandLogo";
import { HomePointer } from "../HomePointer";
import { ContactExperience } from "../ContactExperience";
import { EditorialFooter } from "../actualites/EditorialFooter";
import { MobileMenu } from "../MobileMenu";

const navigation = [
  ["Notre entreprise", "/#entreprise"],
  ["Nos marques", "/#marques"],
  ["Actualités", "/actualites", "Actualités & événements"],
  ["Contact", "/contact"],
] as const;

export const metadata: Metadata = {
  title: "Contact | Multiproduit Mali",
  description: "Échangez avec Multiproduit Mali au sujet d’un partenariat, de la distribution de nos boissons ou de toute autre demande.",
};

type ContactPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parameter(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const brand = parameter(params.brand);
  const flavour = parameter(params.flavour);
  const source = parameter(params.source);
  const initialBrand = brand === "tropicoul" || brand === "triplex" || brand === "vimto" ? brand : undefined;

  return (
    <div className="contact-page">
      <header className="site-header contact-header">
        <Link className="wordmark wordmark--logo" href="/" aria-label="Multiproduit Mali, retour à l’accueil"><BrandLogo /></Link>
        <HomePointer />
        <nav className="desktop-nav" aria-label="Navigation principale">
          {navigation.map(([label, href]) => <Link href={href} key={href} aria-current={href === "/contact" ? "page" : undefined}>{label}</Link>)}
        </nav>
        <MobileMenu navigation={navigation} />
      </header>
      <main id="main-content">
        <ContactExperience initialBrand={initialBrand} initialFlavour={flavour} source={source} />
      </main>
      <EditorialFooter />
    </div>
  );
}
