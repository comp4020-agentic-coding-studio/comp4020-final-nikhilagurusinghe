import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit .next/standalone so the Docker runtime stage can ship the server
  // without node_modules or the build toolchain.
  output: "standalone",
  // The repo root is one level up, so tracing has to start there to resolve
  // dependencies correctly inside the image.
  outputFileTracingRoot: __dirname,
  // libsql ships a native .node binding — leave it as a runtime require
  // instead of letting the bundler try to inline it.
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default nextConfig;
