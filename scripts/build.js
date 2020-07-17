const { build } = require("esbuild");
const { join } = require("path");

build({
  entryPoints: [join(process.cwd(), "src/index.js")],
  bundle: true,
  minify: false,
  outdir: join(process.cwd(), "dist"),
  format: "cjs",
  platform: "node",
});

build({
  entryPoints: [join(process.cwd(), "src/firebase-auth-lite.js")],
  bundle: true,
  minify: false,
  outdir: join(process.cwd(), "dist"),
  target: "es2019",
  format: "esm",
  platform: "browser",
  external: ["firebase-auth-lite"],
});
