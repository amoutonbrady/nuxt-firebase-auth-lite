import FirebaseAuth from "firebase-auth-lite";

const firebasePlugin = (_, inject) => {
  const firebaseAuth = new FirebaseAuth({
    apiKey: "<%= options.apiKey %>",
    redirectUri: "",
  });

  let fireUser = null;
  let fireToken = null;

  firebaseAuth.listen((user) => {
    fireUser = user;
    fireToken = user?.tokenManager?.idToken ?? null;
  });

  inject("fireAuth", firebaseAuth);
  inject("fireUser", fireUser);
  inject("fireToken", fireToken);
};

export default firebasePlugin;
