import FirebaseAuth from "firebase-auth-lite";

const firebasePlugin = (_, inject) => {
  const firebaseAuth = new FirebaseAuth({
    apiKey: "<%= options.apiKey %>",
    redirectUri: "",
  });

  let user = null;
  const fireUser = () => user;

  let token = null;
  const fireToken = () => token;

  firebaseAuth.listen((user) => {
    user = user;
    token = user?.tokenManager?.idToken ?? null;
  });

  inject("fireAuth", firebaseAuth);
  inject("fireUser", fireUser);
  inject("fireToken", fireToken);
};

export default firebasePlugin;
