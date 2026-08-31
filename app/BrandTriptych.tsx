"use client";

import Image from "next/image";
import Link from "./PlainLink";
import { useState } from "react";

type BrandId = "tropicoul" | "triplex" | "vimto";

const brands = [
  {
    id: "tropicoul" as const,
    label: "Tropicoul",
    signature: "Le soleil se partage, bien frais.",
    href: "/#marques",
  },
  {
    id: "triplex" as const,
    label: "Triplex",
    signature: "L’énergie pour garder le rythme.",
    href: "/produits/triplex-original",
  },
  {
    id: "vimto" as const,
    label: "Vimto Sparkling",
    signature: "Le goût pétillant des moments réunis.",
    href: "/produits/vimto-sparkling",
  },
] as const;

function TropicoulVisual() {
  return (
    <>
      <Image
        className="brand-triptych__background"
        src="/media/mpm/universes/tropicoul-ananas/ananas-background-hero-desktop-v01.webp"
        alt=""
        fill
        sizes="(max-width: 720px) 100vw, 52vw"
      />
      <Image
        className="brand-triptych__fruit"
        src="/media/mpm/universes/tropicoul-ananas/ananas-fruit-cluster-mid-v01.webp"
        alt=""
        width={1600}
        height={1600}
        sizes="(max-width: 720px) 58vw, 30vw"
      />
      <Image
        className="brand-triptych__splash"
        src="/media/mpm/universes/tropicoul-ananas/ananas-splash-mid-v01.webp"
        alt=""
        width={2200}
        height={1650}
        sizes="(max-width: 720px) 100vw, 58vw"
      />
      <div className="brand-triptych__tropicoul-cans" aria-hidden="true">
        <Image src="/media/mpm/products/tropicoul-ananas/packshot.png" alt="" width={2048} height={2048} sizes="16vw" />
        <Image src="/media/mpm/products/tropicoul-mangue/packshot.png" alt="" width={2048} height={2048} sizes="14vw" />
        <Image src="/media/mpm/products/tropicoul-orange/packshot.png" alt="" width={2048} height={2048} sizes="14vw" />
      </div>
    </>
  );
}

function TriplexVisual() {
  return (
    <>
      <Image
        className="brand-triptych__background"
        src="/media/simpara/triplex/triplex-hero.png"
        alt=""
        fill
        sizes="(max-width: 720px) 100vw, 52vw"
      />
      <Image
        className="brand-triptych__triplex-fallback"
        src="/media/mpm/products/triplex/packshot.webp"
        alt=""
        width={1200}
        height={1600}
        sizes="(max-width: 720px) 48vw, 23vw"
      />
      <span className="brand-triptych__steel" aria-hidden="true" />
    </>
  );
}

function VimtoVisual() {
  return (
    <>
      <Image
        className="brand-triptych__background"
        src="/media/mpm/universes/vimto-sparkling/vimto-editorial-lifestyle-v03.webp"
        alt=""
        fill
        sizes="(max-width: 720px) 100vw, 52vw"
      />
      <span className="brand-triptych__vimto-glow" aria-hidden="true" />
      <Image
        className="brand-triptych__vimto-can"
        src="/media/mpm/universes/vimto-sparkling/vimto-can-cutout-approved-v002.png"
        alt=""
        width={2400}
        height={3200}
        sizes="(max-width: 720px) 42vw, 24vw"
      />
    </>
  );
}

export function BrandTriptych() {
  const [hoveredBrand, setHoveredBrand] = useState<BrandId | null>(null);

  return (
    <div
      className="brand-triptych"
      data-active-brand={hoveredBrand ?? "none"}
      onMouseLeave={() => setHoveredBrand(null)}
    >
      {brands.map((brand, index) => (
        <Link
          className="brand-triptych__panel"
          data-brand={brand.id}
          href={brand.href}
          key={brand.id}
          onMouseEnter={() => setHoveredBrand(brand.id)}
          onFocus={() => setHoveredBrand(brand.id)}
          onBlur={() => setHoveredBrand(null)}
          aria-label={`Découvrir ${brand.label} — ${brand.signature}`}
        >
          <span className="brand-triptych__visual" aria-hidden="true">
            {brand.id === "tropicoul" && <TropicoulVisual />}
            {brand.id === "triplex" && <TriplexVisual />}
            {brand.id === "vimto" && <VimtoVisual />}
          </span>
          <span className="brand-triptych__shade" aria-hidden="true" />
          <span className="brand-triptych__copy">
            <span className="brand-triptych__index">0{index + 1}</span>
            <span className="brand-triptych__name">{brand.label}</span>
            <span className="brand-triptych__signature">{brand.signature}</span>
            <span className="brand-triptych__hint">Découvrir <span aria-hidden="true">↗</span></span>
          </span>
        </Link>
      ))}
    </div>
  );
}
