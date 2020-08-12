import { Module } from "@nuxt/types";
import { Auth, User } from "./mod";
declare const firebaseAuthLiteModule: Module<{
    apiKey: string;
}>;
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
