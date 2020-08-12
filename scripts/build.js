const { build } = require("esbuild");
const { join } = require("path");

build({
  entryPoints: [join(process.cwd(), "src/index.ts")],
  bundle: true,
  minify: false,
  outdir: join(process.cwd(), "dist"),
  format: "cjs",
  platform: "node",
});

build({
  entryPoints: [join(process.cwd(), "src/firebase-auth-lite.ts")],
  bundle: true,
  minify: false,
  outdir: join(process.cwd(), "dist"),
  target: "es2019",
  format: "cjs",
  platform: "node",
  external: ["cookie-universal"],
});
