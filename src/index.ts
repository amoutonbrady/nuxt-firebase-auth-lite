import { resolve } from "path";
import { Module } from "@nuxt/types";
import { Auth, User } from "./mod";

const firebaseAuthLiteModule: Module<{ apiKey: string }> = function (options) {
  // Don't include when no apiKey is given
  if (!options.apiKey) return;

  // Register plugin
  this.addPlugin({
    src: resolve(__dirname, "firebase-auth-lite.js"),
    fileName: "firebase-auth-lite.js",
    ssr: true,
    options,
  });
};

export default firebaseAuthLiteModule;

export { default as meta } from "../package.json";

declare module "vue/types/vue" {
  interface Vue {
    $fireAuth: Auth;
    $fireUser: () => User | null;
    $fireToken: () => string | null;
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $fireAuth: Auth;
    $fireUser: () => User | null;
    $fireToken: () => string | null;
  }
}

declare module "vuex/types/index" {
  interface Store<S> {
    $fireAuth: Auth;
    $fireUser: () => User | null;
    $fireToken: () => string | null;
  }
}
