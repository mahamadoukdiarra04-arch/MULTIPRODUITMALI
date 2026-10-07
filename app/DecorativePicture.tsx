"use client";

import { useCallback, useState, type CSSProperties, type ImgHTMLAttributes } from "react";

import type { DecorativeAsset } from "./decorative-assets";

type DecorativePictureProps = {
  asset: DecorativeAsset;
  className: string;
  sizes: string;
  style: CSSProperties;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  fetchPriority?: ImgHTMLAttributes<HTMLImageElement>["fetchPriority"];
  reveal?: boolean;
};

export function DecorativePicture({
  asset,
  className,
  sizes,
  style,
  loading = "lazy",
  fetchPriority = "auto",
  reveal = true,
}: DecorativePictureProps) {
  const [loaded, setLoaded] = useState(!reveal);
  const handleImageRef = useCallback((image: HTMLImageElement | null) => {
    if (!reveal || !image?.complete) return;
    queueMicrotask(() => setLoaded(true));
  }, [reveal]);
  const desktop = asset.sources?.desktop;
  const mobile = asset.sources?.mobile;
  const fallback = desktop?.webp ?? desktop?.png ?? desktop?.avif ?? asset.src;
  const width = desktop?.width ?? 1536;
  const height = desktop?.height ?? 1024;

  return (
    <picture className="decorative-picture">
      {mobile?.webp ? <source media="(max-width: 720px)" type="image/webp" srcSet={mobile.webp} /> : null}
      {mobile?.png ? <source media="(max-width: 720px)" type="image/png" srcSet={mobile.png} /> : null}
      {desktop?.webp ? <source type="image/webp" srcSet={desktop.webp} /> : null}
      {desktop?.png ? <source type="image/png" srcSet={desktop.png} /> : null}
      <img
        ref={handleImageRef}
        className={`${className}${reveal ? " decorative-asset-reveal" : ""}${loaded ? " is-loaded" : ""}`}
        src={fallback}
        alt={asset.alt}
        width={width}
        height={height}
        sizes={sizes}
        decoding="async"
        loading={loading}
        fetchPriority={fetchPriority}
        onLoad={() => setLoaded(true)}
        style={{ ...style, "--asset-opacity": asset.opacity ?? 1 } as CSSProperties}
        data-motion={asset.motion.preset}
        data-asset-id={asset.id}
        data-fit={asset.fit ?? "contain"}
        data-hide-on-mobile={asset.hideOnMobile ? "true" : undefined}
      />
    </picture>
  );
}
