import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Resolve from this config file instead of the caller's working directory.
  outputFileTracingRoot: appRoot,
  turbopack: {
    root: appRoot,
    resolveAlias: {
      tailwindcss: path.join(appRoot, "node_modules/tailwindcss/index.css"),
    },
  },
};

export default nextConfig;
