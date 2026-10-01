import type { NextConfig } from "next";

// Statyczny eksport na GitHub Pages. Strona żyje pod /<nazwa-repo>/, więc
// basePath ustawia workflow (.github/workflows/pages.yml); lokalnie jest pusty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
