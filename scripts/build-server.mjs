import { build } from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";
await build({
  entryPoints: ["server/main.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  outfile: "dist-server/main.js",
  sourcemap: true,
});
