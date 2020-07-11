const { build } = require("esbuild");
const { join } = require("path");

build({
  entryPoints: [join(process.cwd(), "src/index.js")],
  bundle: true,
  minify: true,
  outdir: join(process.cwd(), "dist"),
  format: "cjs",
  platform: "node",
});

build({
  entryPoints: [join(process.cwd(), "src/firebase-auth-lite.js")],
  bundle: true,
  minify: true,
  outdir: join(process.cwd(), "dist"),
  format: "esm",
  platform: "browser",
});
