interface ProvidersForEmail {
  allProviders: string[];
  registered: boolean;
  sessionId: string;
  signinMethods: string[];
}
interface ProviderUserInfo {
  providerId: string;
  federatedId: string;
  rawId: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  screenName?: string;
  phoneNumber?: string;
}
interface UserInfo {
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
interface TokenManager {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}
interface User extends UserInfo {
  tokenManager: TokenManager;
}
interface Storage {
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  remove(key: string): Promise<void>;
}
interface ProviderSignInOptions {
  provider: string;
  oauthScope?: string;
  context?: string;
  linkAccount?: boolean;
}
interface AuthInit {
  name?: string;
  apiKey: string;
  redirectUri?: string;
  storage?: Storage;
}
export default class Auth {
  readonly apiKey: string;
  readonly name: string;
  readonly storage: Storage;
  readonly redirectUri?: string;
  private listeners;
  private ref?;
  user?: User;
  constructor(init?: AuthInit);
  private emit;
  private sKey;
  private api;
  private enforceAuth;
  private setState;
  listen(cb: (user: User | null) => any): Function;
  signOut(): Promise<void>;
  private refreshIdToken;
  authorizedRequest(resource: any, init: any): Promise<Response>;
  signInWithCustomToken(token: string): Promise<void>;
  signInWithProvider(options: ProviderSignInOptions | string): Promise<void>;
  finishProviderSignIn(requestUri?: string): Promise<string>;
  handleSignInRedirect(): Promise<void | string>;
  signUp(email: string, password: string): Promise<void>;
  signIn(email?: string, password?: string): Promise<void>;
  sendOobCode(requestType: any, email: any): Promise<any>;
  resetPassword(oobCode: string, newPassword?: string): Promise<string>;
  fetchProvidersForEmail(email: any): Promise<ProvidersForEmail>;
  fetchProfile(tokenManager?: TokenManager): Promise<void>;
  updateProfile(newData: any): Promise<void>;
  deleteAccount(): Promise<void>;
}

declare module "vue/types/vue" {
  interface Vue {
    $fireAuth: Auth;
    $fireUser: User | null;
    $fireToken: string | null;
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $fireAuth: Auth;
    $fireUser: User | null;
    $fireToken: string | null;
  }
}

declare module "vuex/types/index" {
  interface Store<S> {
    $fireAuth: Auth;
    $fireUser: User | null;
    $fireToken: string | null;
  }
}
