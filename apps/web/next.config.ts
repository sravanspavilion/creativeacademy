import { join } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo: trace serverless bundle files from the workspace root so the
  // built packages/shared (dist/) is included in server bundles & Vercel
  // functions. Without this, tracing stops at apps/web and the build
  // succeeds but the function crashes at runtime (MODULE_NOT_FOUND).
  outputFileTracingRoot: join(__dirname, "../../"),
};

export default nextConfig;