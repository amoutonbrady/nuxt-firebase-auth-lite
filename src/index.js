import { resolve } from "path";

export default function firebaseAuthLiteModule(options) {
  // Don't include when no apiKey is given
  if (!options.apiKey) return;

  // Register plugin
  this.addPlugin({
    src: resolve(__dirname, "firebase-auth-lite.js"),
    fileName: "firebase-auth-lite.js",
    ssr: false,
    options,
  });
}

export { default as meta } from "../package.json";
