import Image from "next/image";

const BRAND_LOGO_SRC = "/media/mpm/brand/multiproduit-mali-logo-192.webp";

export function BrandLogo({ eager = true }: { eager?: boolean }) {
  return (
    <span className="brand-logo" aria-hidden="true">
      <Image
        src={BRAND_LOGO_SRC}
        alt=""
        width={192}
        height={192}
        sizes="(max-width: 720px) 50px, 58px"
        decoding="async"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "low"}
        unoptimized
      />
    </span>
  );
}
