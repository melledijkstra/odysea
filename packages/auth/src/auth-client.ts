import { IStorage, MemoryCache } from '@melledijkstra/storage'
import { Logger } from '@melledijkstra/toolbox'
import {
  OAuth2Client,
  OAuth2Token,
  generateCodeVerifier,
} from '@badgateway/oauth2-client'
import type { AuthConfig, OauthProvider } from './providers'
export type { OauthProvider }

const OAUTH2_STORAGE_KEY = 'oauth2'

// Make it match OAuth2Token from badgateway mostly
export type TokenStore = {
  accessToken: string
  expiresAt: number | null
  refreshToken: string | null
  scopes?: string[]
}

export interface AuthFlowHandler {
  /**
   * Opens the authentication URL and returns the redirect URL with the code.
   * @param url The authorization URL to open
   */
  open(url: URL): Promise<URL>
}

// Generate state logic extracted from badgateway/oauth2-client or just simple random string
function generateState(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(4)
    crypto.getRandomValues(array)
    return Array.from(array, (dec) => ('0' + dec.toString(16)).substr(-2)).join('')
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export class AuthClient {
  protected _storage: IStorage
  protected _redirectUrl: string
  protected _state: string | undefined
  protected _codeVerifier: string | undefined
  protected _logger: Logger
  protected _handler: AuthFlowHandler | undefined
  protected _tokenPromise: Promise<string | undefined> | null = null
  provider: AuthConfig

  constructor(
    provider: AuthConfig,
    redirectUrl: string,
    {
      storage = new MemoryCache(),
      handler,
    }: {
      storage?: IStorage
      handler?: AuthFlowHandler
    } = {}
  ) {
    this._logger = new Logger(`auth:${provider.name}`)
    this.provider = provider
    this._redirectUrl = redirectUrl
    this._storage = storage
    this._handler = handler
  }

  /**
   * Intentionally instantiates a new OAuth2Client on every call rather than caching.
   * This ensures that if the underlying credentials change dynamically at runtime,
   * the latest credentials are always used.
   */
  protected get _oauth2Client(): OAuth2Client {
    // We assume server is required by OAuth2Client but we can just use the authEndpoint domain as base if not provided.
    // Or we provide a dummy server if we have explicit endpoints.
    const serverUrl = this.provider.authEndpoint
      ? new URL(this.provider.authEndpoint).origin
      : 'https://example.com' // Fallback for some reason

    return new OAuth2Client({
      server: serverUrl,
      clientId: this.provider.clientId,
      clientSecret: this.provider.clientSecret ?? undefined,
      authorizationEndpoint: this.provider.authEndpoint,
      tokenEndpoint: this.provider.tokenEndpoint,
      discoveryEndpoint: this.provider.discoveryEndpoint,
    })
  }

  get storageKey() {
    return `${OAUTH2_STORAGE_KEY}.${this.provider.name}`
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthTokenFromStorage()
    return !!token
  }

  async hasGrantedScopes(scopes: string[]): Promise<boolean> {
    const grantedScopes = await this.getGrantedScopes()
    return scopes.every((scope) => grantedScopes.includes(scope))
  }

  static isExpired(token: TokenStore): boolean {
    if (!token.expiresAt) return false
    // we subtract 1 minute to make sure we don't try to use a token that is about to expire
    return Date.now() >= token.expiresAt - 60000
  }

  async getAuthTokenFromStorage(): Promise<TokenStore | undefined> {
    return this._storage.get<TokenStore>(this.storageKey)
  }

  async getGrantedScopes(): Promise<string[]> {
    const token = await this.getAuthTokenFromStorage()
    return token?.scopes || []
  }

  async revokeToken(): Promise<void> {
    const tokenStore = await this.getAuthTokenFromStorage()

    if (!tokenStore) {
      this._logger.warn('Could not revoke token: not authenticated')
      return
    }

    const token = tokenStore.accessToken

    this._logger.log('revoke token starting')

    await this.removeAuthTokenFromStorage()

    if (this.provider.skipServerRevoke) {
      this._logger.log('skipping server revoke for this provider')
      return
    }

    try {
      // badgateway currently does not have a high level revokeToken like arctic, but we can do it via introspection / revoke endpoint if discovery gives it,
      // but in absence of a clear API we might skip or let consumer handle it?
      // OAuth2Client in badgateway has no explicit revokeToken, we might just have to clear storage.
      this._logger.warn('Server side revoke is not fully supported without a revoke endpoint. Only cleared from storage.')
    } catch (e) {
      this._logger.error('Unknown error while revoking token', {
        e,
        token,
      })
    }
  }

  async removeAuthTokenFromStorage() {
    await this._storage.delete(this.storageKey)
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuth2Token | null> {
    if (!this.provider.clientId) {
      this._logger.warn('Cannot refresh token: client ID is not configured')
      return null
    }

    const tokenObj: OAuth2Token = {
      accessToken: '',
      refreshToken: refreshToken,
      expiresAt: null
    }

    try {
      return await this._oauth2Client.refreshToken(tokenObj)
    } catch (e) {
      this._logger.error('Failed to refresh token', { e })
      return null
    }
  }

  protected isInvalidTokenError(error: unknown): boolean {
    // Basic heuristic since we don't have OAuth2RequestError exported from badgateway yet
    return String(error).includes('invalid_grant')
  }

  private async tryRefreshToken(
    refreshTokenStr: string
  ): Promise<string | undefined> {
    if (!this.provider.clientId) {
      this._logger.warn('Cannot refresh token: client ID is not configured')
      return undefined
    }
    this._logger.log('token expired, trying to refresh it')
    try {
      const newTokens = await this.refreshAccessToken(refreshTokenStr)
      if (!newTokens) {
        throw new Error('Failed to refresh token - user must re-authenticate.')
      }

      const newAccessToken = newTokens.accessToken
      this._logger.log('refreshed new access token, storing it and continue')

      const storeToken = await this.getAuthTokenFromStorage()

      await this.cacheAuthToken(
        newAccessToken,
        newTokens.refreshToken ?? refreshTokenStr,
        newTokens.expiresAt,
        storeToken?.scopes // badgateway refreshToken doesn't return scopes usually
      )
      return newAccessToken
    } catch (error) {
      if (this.isInvalidTokenError(error)) {
        this._logger.warn('Refresh token is invalid, clearing storage')
        await this._storage.delete(this.storageKey)
      } else {
        this._logger.error('Failed to refresh access token', { error })
      }
      return undefined
    }
  }

  async getTokenFromStoreOrRefreshToken(): Promise<string | undefined> {
    if (this._tokenPromise) {
      this._logger.log(
        'token retrieval already in progress, returning pending promise'
      )
      return this._tokenPromise
    }

    this._tokenPromise = (async () => {
      try {
        const storeToken = await this.getAuthTokenFromStorage()
        this._logger.debug('token in storage?', !!storeToken)

        if (!storeToken) return undefined

        if (!AuthClient.isExpired(storeToken)) {
          return storeToken.accessToken
        }

        if (storeToken.refreshToken) {
          return await this.tryRefreshToken(storeToken.refreshToken)
        }

        return undefined
      } finally {
        this._tokenPromise = null
      }
    })()

    return this._tokenPromise
  }

  async cacheAuthToken(
    accessToken: string,
    refreshToken: string | null,
    expiresAt: number | null,
    scopes?: string[]
  ) {
    const tokenStore: TokenStore = {
      accessToken,
      refreshToken,
      expiresAt,
      scopes,
    }

    await this._storage.set(this.storageKey, tokenStore)
  }

  get authStateKey() {
    return `${OAUTH2_STORAGE_KEY}.state.${this.provider.name}`
  }

  async createAuthUrl(
    requestedScopes: string[] = [],
    loginHint?: string
  ): Promise<URL | undefined> {
    this._state = generateState()

    // badgateway's generateCodeVerifier is async
    this._codeVerifier = await generateCodeVerifier()

    const previousScopes = await this.getGrantedScopes()
    const allScopes = Array.from(
      new Set([...this.provider.scopes, ...previousScopes, ...requestedScopes])
    )

    await this._storage.set(this.authStateKey, {
      state: this._state,
      codeVerifier: this._codeVerifier,
    })

    const url = await this._oauth2Client.authorizationCode.getAuthorizeUri({
      redirectUri: this._redirectUrl,
      state: this._state,
      codeVerifier: this._codeVerifier,
      scope: allScopes,
    })

    const finalUrl = new URL(url)

    // add login_hint if provided
    if (loginHint) {
      finalUrl.searchParams.set('login_hint', loginHint)
    }

    if (this.provider.extraParams) {
      for (const [key, value] of Object.entries(this.provider.extraParams)) {
        finalUrl.searchParams.set(key, value)
      }
    }

    return finalUrl
  }

  async validate(code: string, state: string): Promise<OAuth2Token> {
    const storedState = await this._storage.get<{
      state: string
      codeVerifier: string
    }>(this.authStateKey)
    const { state: savedState, codeVerifier: savedCodeVerifier } =
      storedState ?? {}

    if (!code || !savedState || state !== savedState || !savedCodeVerifier) {
      throw new Error('Code or state mismatch')
    }

    this._logger.log({
      code,
      savedCode: savedCodeVerifier,
    })

    const urlWithCode = new URL(this._redirectUrl)
    urlWithCode.searchParams.set('code', code)
    urlWithCode.searchParams.set('state', state)

    const tokens = await this._oauth2Client.authorizationCode.getTokenFromCodeRedirect(
      urlWithCode.toString(),
      {
        redirectUri: this._redirectUrl,
        state: savedState,
        codeVerifier: savedCodeVerifier
      }
    )

    // Clean up auth state
    await this._storage.delete(this.authStateKey)

    return tokens
  }

  getContext() {
    return {
      state: this._state,
      codeVerifier: this._codeVerifier,
    }
  }

  async getAuthToken(
    interactive = false,
    requestedScopes?: string[],
    loginHint?: string
  ): Promise<string | undefined> {
    const storedToken = await this.getTokenFromStoreOrRefreshToken()
    const grantedScopes = await this.getGrantedScopes()

    // Check if we need to request new scopes
    const hasAllRequestedScopes = requestedScopes
      ? requestedScopes.every((scope) => grantedScopes.includes(scope))
      : true

    if (storedToken && hasAllRequestedScopes) {
      this._logger.log('using stored token with all necessary scopes')
      return storedToken
    } else if (!interactive && !hasAllRequestedScopes) {
      this._logger.log(
        'missing requested scopes but not interactive, returning nothing'
      )
      return undefined
    } else if (!interactive && !storedToken) {
      this._logger.log(
        'no token retrieved, but not interactive, so returning nothing'
      )
      return
    }

    this._logger.log(
      'no token retrieved or missing scopes, continue with normal oauth2 flow...'
    )

    const url = await this.createAuthUrl(requestedScopes, loginHint)

    if (!url) {
      this._logger.error('Failed to create auth URL')
      return
    }

    this._logger.debug('Generated Auth URL:', url.href, {
      provider: this.provider.name,
      scopes: requestedScopes,
      clientId: this.provider.clientId,
      clientSecret: this.provider.clientSecret ? '***' : undefined,
    })

    if (this._handler) {
      return this.handleRedirectFlow(url, requestedScopes)
    }
  }

  private async handleRedirectFlow(url: URL, requestedScopes: string[] = []): Promise<string | undefined> {
    try {
      const redirectUrl = await this._handler!.open(url)
      const code = redirectUrl.searchParams.get('code')
      const state = redirectUrl.searchParams.get('state')

      if (!code || !state) {
        this._logger.error('Redirect URL missing code or state', {
          href: redirectUrl.href,
        })
        return undefined
      }

      const tokens = await this.validate(code, state)

      const refreshToken = tokens.refreshToken ?? null

      let scopesToSave: string[] | undefined = undefined
      // badgateway might not parse scopes from the token response if it doesn't return them
      // we'll use the requested/granted scopes
      scopesToSave = Array.from(new Set([...(await this.getGrantedScopes()), ...requestedScopes]))

      await this.cacheAuthToken(
        tokens.accessToken,
        refreshToken,
        tokens.expiresAt,
        scopesToSave
      )
      return tokens.accessToken
    } catch (error) {
      this._logger.error('Auth flow failed', { error })
      return undefined
    }
  }
}
