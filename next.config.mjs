import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the project root (there is an unrelated lockfile higher up on some machines).
  outputFileTracingRoot: root,
  turbopack: { root },
  // The share-card renderer reads these fonts from disk at runtime.
  outputFileTracingIncludes: {
    "/api/quote/card": ["./assets/fonts/**"],
    "/opengraph-image": ["./assets/fonts/**"],
  },
};

export default nextConfig;
