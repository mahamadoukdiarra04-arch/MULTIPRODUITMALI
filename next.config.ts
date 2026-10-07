import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages are build tooling, not production server dependencies.
  // Keeping them inside the bundle prevents Nitro from copying several
  // competing AJV trees in parallel on Windows and keeps Hostinger's output
  // focused on the actual runtime packages.
  transpilePackages: ["eslint", "keyv", "postcss", "typescript", "webpack"],
};

export default nextConfig;
