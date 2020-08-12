/**
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
export declare class Auth {
    readonly apiKey: string;
    readonly name: string;
    readonly redirectUri?: string;
    readonly storage: Storage;
    private listeners;
    private ref?;
    user?: User | null;
    constructor(init?: AuthInit);
    /** Set up a function that will be called whenever the user state is changed. */
    listen(cb: Function): Function;
    private emit;
    private sKey;
    /** Make post request to a specific endpoint, and return the response */
    private api;
    /**
     * Makes sure the user is logged in and has up-to-date credentials.
     * @throws
     */
    private enforceAuth;
    /** Updates the user data in the localStorage */
    private setState;
    /**
     * Sign out the currently signed in user.
     * Removes all data stored in the storage that's associated with the user.
     */
    signOut(): void;
    /**
     * Refreshes the idToken by using the locally stored refresh token
     * only if the idToken has expired.
     */
    private refreshIdToken;
    /**
     * Uses native fetch, but adds authorization headers otherwise the API is exactly the same as native fetch.
     */
    authorizedRequest(input: RequestInfo, init?: RequestInit): Promise<Response>;
    /**
     * Signs in or signs up a user by exchanging a custom Auth token.
     * @param {string} token The custom token.
     */
    signInWithCustomToken(token: string): Promise<void>;
    /**
     * Start auth flow of a federated Id provider.
     * Will redirect the page to the federated login page.
     */
    signInWithProvider(options: ProviderSignInOptions | string): Promise<void>;
    /**
     * Signs in or signs up a user using credentials from an Identity Provider (IdP) after a redirect.
     * Will fail silently if the URL doesn't have a "code" search param.
     * @param {string} [requestUri] The request URI with the authorization code, state etc. from the IdP.
     * @private
     */
    finishProviderSignIn(requestUri?: string): Promise<string>;
    /**
     * Handles all sign in flows that complete via redirects.
     * Fails silently if no redirect was detected.
     */
    handleSignInRedirect(): Promise<void | string>;
    /**
     * Signs up with email and password or anonymously when no arguments are passed.
     * Automatically signs the user in on completion.
     */
    signUp(email: string, password: string): Promise<void>;
    /** Signs in a user with email and password */
    signIn(email?: string, password?: string): Promise<void>;
    /**
     * Sends an out-of-band confirmation code for an account.
     * Can be used to reset a password, to verify an email address and send a Sign-in email link.
     * The `email` argument is not needed only when verifying an email(In that case it will be completely ignored, even if specified), otherwise it is required.
     * @param {'PASSWORD_RESET'|'VERIFY_EMAIL'|'EMAIL_SIGNIN'} requestType The type of out-of-band (OOB) code to send.
     * @param {string} [email] When the `requestType` is `PASSWORD_RESET` or `EMAIL_SIGNIN` you need to provide an email address.
     * @returns {Promise}
     */
    sendOobCode(requestType: "PASSWORD_RESET" | "VERIFY_EMAIL" | "EMAIL_SIGNIN", email: string): Promise<any>;
    /**
     * Sets a new password by using a reset code.
     * Can also be used to very oobCode by not passing a password.
     */
    resetPassword(oobCode: string, newPassword?: string): Promise<string>;
    /**
     * Returns info about all providers associated with a specified email.
     * @param {string} email The user's email address.
     * @returns {ProvidersForEmailResponse}
     */
    fetchProvidersForEmail(email: string): Promise<ProvidersForEmail>;
    /**
     * Gets the user data from the server, and updates the local caches.
     * @param {Object} [tokenManager] Only when not logged in.
     * @throws Will throw if the user is not signed in.
     */
    fetchProfile(tokenManager?: TokenManager | undefined | null): Promise<void>;
    /**
     * Update user's profile.
     * @param {Object} newData An object with the new data to overwrite.
     * @throws Will throw if the user is not signed in.
     */
    updateProfile(newData: object): Promise<void>;
    /**
     * Deletes the currently logged in account and logs out.
     * @throws Will throw if the user is not signed in.
     */
    deleteAccount(): Promise<void>;
}
