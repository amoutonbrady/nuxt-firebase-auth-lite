import { Auth, Storage } from "./mod";
import { Plugin } from "@nuxt/types";

const firebasePlugin: Plugin = (ctx, inject) => {
  const storage: Storage = {
    set(key, value) {
      return ctx.app.$cookies.set(key, value, {
        sameSite: "strict",
        path: "/",
      });
    },
    get(key) {
      return ctx.app.$cookies.get(key);
    },
    remove(key) {
      return ctx.app.$cookies.remove(key);
    },
  };

  const firebaseAuth = new Auth({
    apiKey: "<%= options.apiKey %>",
    redirectUri: "",
    storage,
  });

  const fireUser = () => firebaseAuth.user || null;
  const fireToken = () => fireUser()?.tokenManager?.idToken ?? null;

  inject("fireAuth", firebaseAuth);
  inject("fireUser", fireUser);
  inject("fireToken", fireToken);
};

export default firebasePlugin;
