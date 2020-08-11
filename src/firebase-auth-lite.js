import FirebaseAuth from "firebase-auth-lite";

const firebasePlugin = (_, inject) => {
  const firebaseAuth = new FirebaseAuth({
    apiKey: "<%= options.apiKey %>",
    redirectUri: "",
  });

  const fireUser = () => firebaseAuth.user || null;
  const fireToken = () => fireUser()?.tokenManager?.idToken ?? null;

  inject("fireAuth", firebaseAuth);
  inject("fireUser", fireUser);
  inject("fireToken", fireToken);
  inject("apiKey", "<%= options.apiKey %>");
};

export default firebasePlugin;
