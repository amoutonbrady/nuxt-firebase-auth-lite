import { Plugin } from "@nuxt/types";
import cookieUniversal from "cookie-universal";
import { Auth, Storage } from "./mod";

const firebasePlugin: Plugin = ({ req, res }, inject) => {
  const cookie = cookieUniversal(req, res, true);
  const storage: Storage = {
    set(key, value) {
      return cookie.set(key, value, {
        sameSite: "strict",
        path: "/",
      });
    },
    get(key) {
      return cookie.get(key);
    },
    remove(key) {
      return cookie.remove(key);
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
