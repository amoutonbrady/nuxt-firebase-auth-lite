/**
 * /!\ THIS CODE IS ENTIRELY COPIED/PASTED FROM THIS REPO:
 * https://github.com/samuelgozi/firebase-auth-lite
 *
 * I ONLY ADDED A COUPLE MODIFICATION TO MAKE IT WORK SERVER SIDE
 *
 * Partial documentation fot the Firebase API can be found here.
 * https://cloud.google.com/identity-platform/docs/reference/rest/v1/accounts
 */

export interface ProvidersForEmail {
  allProviders: string[];
  registered: boolean;
  sessionId: string;
  signinMethods: string[];
}

export interface ProviderUserInfo {
  providerId: string;
  federatedId: string;
  rawId: string;

  email?: string;
  displayName?: string;
  photoUrl?: string;
  screenName?: string;
  phoneNumber?: string;
}

export interface UserInfo {
  localId: string;
  lastLoginAt: string;
  createdAt: string;
  lastRefreshAt: string;

  validSince?: string;
  emailVerified?: boolean;
  displayName?: string;
  email?: string;
  language?: string;
  photoUrl?: string;
  timeZone?: string;
  dateOfBirth?: string;
  passwordHash?: string;
  salt?: string;
  version?: number;
  passwordUpdatedAt?: number;
  providerUserInfo?: ProviderUserInfo[];
  disabled?: boolean;
  screenName?: string;
  customAuth?: boolean;
  rawPassword?: string;
  phoneNumber?: string;
  customAttributes?: string;
  emailLinkSignin?: boolean;
  tenantId?: string;
  initialEmail?: string;
}

export interface TokenManager {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface User extends UserInfo {
  tokenManager: TokenManager;
}

export interface Storage {
  /** Save to local storage */
  set<T = string>(key: string, value: T): void;
  /** Get from local storage */
  get<T = string>(key: string): T | null;
  /** Remove from local storage */
  remove(key: string): void;
}

export interface ProviderSignInOptions {
  provider: string;
  oauthScope?: string;
  context?: string;
  linkAccount?: boolean;
}

export interface AuthInit {
  /** Name for this auth instance */
  name?: string;
  /** Firebase API Key for this project */
  apiKey: string;
  /** The uri to use as redirect for provider's sign-in */
  redirectUri?: string;
  /** Storage API to use for persisting data locally*/
  storage?: Storage;
}

const createLocaleStorage: () => Storage = () => ({
  set(k: string, v: any) {
    return localStorage.setItem(k, v);
  },

  get(k: string): any {
    return localStorage.getItem(k);
  },

  remove(k: string) {
    return localStorage.removeItem(k);
  },
});

export class Auth {
  readonly apiKey: string;
  readonly name: string;
  readonly redirectUri?: string;
  readonly storage: Storage;
  private listeners: Array<Function> = [];
  private ref?: Promise<any> | null;
  user?: User | null;

  constructor(init: AuthInit = {} as AuthInit) {
    if (typeof init.apiKey !== "string")
      throw Error('The argument "apiKey" is required');

    this.name = init.name || "default";
    this.apiKey = init.apiKey;
    this.redirectUri = init.redirectUri;
    this.storage = init.storage || createLocaleStorage();

    const user = this.storage.get<User>(this.sKey("User"));
    this.setState(user, false);
    if (user) this.refreshIdToken().then(() => this.fetchProfile());
  }

  /** Set up a function that will be called whenever the user state is changed. */
  listen(cb: Function): Function {
    this.listeners.push(cb);
    return () => (this.listeners = this.listeners.filter((fn) => fn !== cb));
  }

  private emit() {
    this.listeners.forEach((cb) => cb(this.user));
  }

  private sKey(key: string) {
    return `Auth:${key}:${this.apiKey}:${this.name}`;
  }

  /** Make post request to a specific endpoint, and return the response */
  private api(endpoint: string, body: any): any {
    const url =
      endpoint === "token"
        ? `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`
        : `https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${this.apiKey}`;

    return fetch(url, {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }).then(async (response) => {
      let data = await response.json();

      // If the response returned an error, try to get a Firebase error code/message.
      // Sometimes the error codes are joined with an explanation, we don't need that(its a bug).
      // So we remove the unnecessary part.
      if (!response.ok) {
        throw Error(data.error.message.replace(/: [\w ,.'"()]+$/, ""));
      }

      // Add a hidden date property to the returned object.
      // Used mostly to calculate the expiration date for tokens.
      const date = response.headers.get("date");
      if (!date) return data;

      Object.defineProperty(data, "expiresAt", {
        value: Date.parse(date) + 3600 * 1000,
      });
      return data;
    });
  }

  /**
   * Makes sure the user is logged in and has up-to-date credentials.
   * @throws
   */
  private async enforceAuth() {
    if (!this.user)
      throw Error("The user must be logged-in to use this method.");
    return this.refreshIdToken(); // Won't do anything if the token is valid.
  }

  /** Updates the user data in the localStorage */
  private setState(userData: User | null, persist = true, emit = true) {
    this.user = userData;
    persist &&
      this.storage[userData ? "set" : "remove"](this.sKey("User"), userData);
    emit && this.emit();
  }

  /**
   * Sign out the currently signed in user.
   * Removes all data stored in the storage that's associated with the user.
   */
  signOut() {
    return this.setState(null);
  }

  /**
   * Refreshes the idToken by using the locally stored refresh token
   * only if the idToken has expired.
   */
  private async refreshIdToken(): Promise<void> {
    // If the idToken didn't expire, return.
    const user = this.user;
    if (!user || Date.now() < user.tokenManager.expiresAt) return;

    // If a request for a new token was already made, then wait for it and then return.
    if (this.ref) return await this.ref;

    try {
      // Save the promise so that if this function is called
      // anywhere else we don't make more than one request.
      this.ref = this.api("token", {
        grant_type: "refresh_token",
        refresh_token: user.tokenManager.refreshToken,
      }).then(
        (data: {
          id_token: string;
          refresh_token: string;
          expiresAt: number;
        }) => {
          const tokenManager = {
            idToken: data.id_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expiresAt,
          };
          return this.setState({ ...user, tokenManager }, true, false);
        }
      );

      await this.ref;
    } finally {
      this.ref = null;
    }
  }

  /**
   * Uses native fetch, but adds authorization headers otherwise the API is exactly the same as native fetch.
   */
  async authorizedRequest(input: RequestInfo, init?: RequestInit) {
    const request = input instanceof Request ? input : new Request(input, init);

    if (this.user) {
      await this.refreshIdToken(); // Won't do anything if the token didn't expire yet.
      request.headers.set(
        "Authorization",
        `Bearer ${this.user.tokenManager.idToken}`
      );
    }

    return fetch(request);
  }

  /**
   * Signs in or signs up a user by exchanging a custom Auth token.
   * @param {string} token The custom token.
   */
  async signInWithCustomToken(token: string) {
    // Try to exchange the Auth Code for an idToken and refreshToken.
    // And then get the user profile.
    return await this.fetchProfile(
      await this.api("signInWithCustomToken", {
        token,
        returnSecureToken: true,
      })
    );
  }

  /**
   * Start auth flow of a federated Id provider.
   * Will redirect the page to the federated login page.
   */
  async signInWithProvider(options: ProviderSignInOptions | string) {
    if (!this.redirectUri)
      throw Error(
        'In order to use an Identity provider you should initiate the "Auth" instance with a "redirectUri".'
      );

    // The options can be a string, or an object, so here we make sure we extract the right data in each case.
    // @ts-ignore
    const { provider, oauthScope, context, linkAccount } =
      typeof options === "string" ? { provider: options } : options;

    // Make sure the user is logged in when an "account link" was requested.
    if (linkAccount) await this.enforceAuth();

    // Get the url and other data necessary for the authentication.
    const { authUri, sessionId } = await this.api("createAuthUri", {
      continueUri: this.redirectUri,
      authFlowType: "CODE_FLOW",
      providerId: provider,
      oauthScope,
      context,
    });

    // Save the sessionId that we just received in the local storage.
    // Is required to finish the auth flow, I believe this is used to mitigate CSRF attacks.
    // (No docs on this...)
    this.storage.set(this.sKey("SessionId"), sessionId);
    // Save if this is a fresh log-in or a "link account" request.
    linkAccount && this.storage.set(this.sKey("LinkAccount"), "true");

    // Finally - redirect the page to the auth endpoint.
    location.assign(authUri);
  }

  /**
   * Signs in or signs up a user using credentials from an Identity Provider (IdP) after a redirect.
   * Will fail silently if the URL doesn't have a "code" search param.
   * @param {string} [requestUri] The request URI with the authorization code, state etc. from the IdP.
   * @private
   */
  async finishProviderSignIn(requestUri: string = location.href) {
    // Get the sessionId we received before the redirect from storage.
    const sessionId = this.storage.get(this.sKey("SessionId"));
    // Get the indication if this was a "link account" request.
    const linkAccount = this.storage.get(this.sKey("LinkAccount"));
    // Check for the edge case in which the user signed out before completing the linkAccount
    // Request.
    if (linkAccount && !this.user)
      throw Error(
        'Request to "Link account" was made, but user is no longer signed-in'
      );
    this.storage.remove(this.sKey("LinkAccount"));

    // Try to exchange the Auth Code for an idToken and refreshToken.
    const { idToken, refreshToken, expiresAt, context } = await this.api(
      "signInWithIdp",
      {
        // If this is a "link account" flow, then attach the idToken of the currently logged in account.
        idToken:
          linkAccount && this.user ? this.user.tokenManager.idToken : undefined,
        requestUri,
        sessionId,
        returnSecureToken: true,
      }
    );

    // Now get the user profile.
    await this.fetchProfile({ idToken, refreshToken, expiresAt });

    // Remove sensitive data from the URLSearch params in the location bar.
    history.replaceState(null, "", location.origin + location.pathname);

    return context as string;
  }

  /**
   * Handles all sign in flows that complete via redirects.
   * Fails silently if no redirect was detected.
   */
  async handleSignInRedirect(): Promise<void | string> {
    // Oauth Federated Identity Provider flow.
    if (location.href.match(/[&?]code=/)) return this.finishProviderSignIn();

    // Email Sign-in flow.
    if (location.href.match(/[&?]oobCode=/)) {
      // @ts-ignore
      const oobCode = location.href.match(/[?&]oobCode=([^&]+)/)[1];
      // @ts-ignore
      const email = location.href.match(/[?&]email=([^&]+)/)[1];
      const expiresAt = Date.now() + 3600 * 1000;
      const { idToken, refreshToken } = await this.api("signInWithEmailLink", {
        oobCode,
        email,
      });
      // Now get the user profile.
      await this.fetchProfile({ idToken, refreshToken, expiresAt });
      // Remove sensitive data from the URLSearch params in the location bar.
      history.replaceState(null, "", location.origin + location.pathname);
    }
  }

  /**
   * Signs up with email and password or anonymously when no arguments are passed.
   * Automatically signs the user in on completion.
   */
  async signUp(email: string, password: string) {
    // Sign up and then retrieve the user profile and persists the session.
    return await this.fetchProfile(
      await this.api("signUp", {
        email,
        password,
        returnSecureToken: true,
      })
    );
  }

  /** Signs in a user with email and password */
  async signIn(email?: string, password?: string) {
    // Sign up and then retrieve the user profile and persists the session.
    return await this.fetchProfile(
      await this.api("signInWithPassword", {
        email,
        password,
        returnSecureToken: true,
      })
    );
  }

  /**
   * Sends an out-of-band confirmation code for an account.
   * Can be used to reset a password, to verify an email address and send a Sign-in email link.
   * The `email` argument is not needed only when verifying an email(In that case it will be completely ignored, even if specified), otherwise it is required.
   * @param {'PASSWORD_RESET'|'VERIFY_EMAIL'|'EMAIL_SIGNIN'} requestType The type of out-of-band (OOB) code to send.
   * @param {string} [email] When the `requestType` is `PASSWORD_RESET` or `EMAIL_SIGNIN` you need to provide an email address.
   * @returns {Promise}
   */
  async sendOobCode(
    requestType: "PASSWORD_RESET" | "VERIFY_EMAIL" | "EMAIL_SIGNIN",
    email: string
  ): Promise<any> {
    const verifyEmail = requestType === "VERIFY_EMAIL";
    if (verifyEmail) {
      await this.enforceAuth();
      email = this.user?.email as string;
    }

    return void this.api("sendOobCode", {
      idToken: verifyEmail ? this.user?.tokenManager.idToken : undefined,
      requestType,
      email,
      continueUrl: this.redirectUri
        ? `${this.redirectUri}?email=${email}`
        : undefined,
    });
  }

  /**
   * Sets a new password by using a reset code.
   * Can also be used to very oobCode by not passing a password.
   */
  async resetPassword(oobCode: string, newPassword?: string): Promise<string> {
    return (await this.api("resetPassword", { oobCode, newPassword })).email;
  }

  /**
   * Returns info about all providers associated with a specified email.
   * @param {string} email The user's email address.
   * @returns {ProvidersForEmailResponse}
   */
  async fetchProvidersForEmail(email: string) {
    const response = await this.api("createAuthUri", {
      identifier: email,
      continueUri: location.href,
    });
    delete response.kind;
    return response as ProvidersForEmail;
  }

  /**
   * Gets the user data from the server, and updates the local caches.
   * @param {Object} [tokenManager] Only when not logged in.
   * @throws Will throw if the user is not signed in.
   */
  async fetchProfile(
    tokenManager: TokenManager | undefined | null = this.user &&
      this.user.tokenManager
  ) {
    if (!tokenManager) await this.enforceAuth();
    const tm = tokenManager as TokenManager;

    const userData = (await this.api("lookup", { idToken: tm.idToken }))
      .users[0];

    delete userData.kind;
    userData.tokenManager = tm;

    this.setState(userData);
  }

  /**
   * Update user's profile.
   * @param {Object} newData An object with the new data to overwrite.
   * @throws Will throw if the user is not signed in.
   */
  async updateProfile(newData: object) {
    await this.enforceAuth();
    const user = this.user as User;

    // Calculate the expiration date for the idToken.
    const updatedData = await this.api("update", {
      ...newData,
      idToken: user.tokenManager.idToken,
      returnSecureToken: true,
    });

    const { idToken, refreshToken, expiresAt } = updatedData;

    if (updatedData.idToken) {
      updatedData.tokenManager = { idToken, refreshToken, expiresAt };
    } else {
      updatedData.tokenManager = user.tokenManager;
    }

    delete updatedData.kind;
    delete updatedData.idToken;
    delete updatedData.refreshToken;

    this.setState(updatedData);
  }

  /**
   * Deletes the currently logged in account and logs out.
   * @throws Will throw if the user is not signed in.
   */
  async deleteAccount() {
    await this.enforceAuth();
    const user = this.user as User;

    await this.api("delete", `{"idToken": "${user.tokenManager.idToken}"}`);

    this.signOut();
  }
}
