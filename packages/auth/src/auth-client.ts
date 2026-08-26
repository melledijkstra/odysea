import { IStorage, MemoryCache } from '@melledijkstra/storage'
import { Logger } from '@melledijkstra/toolbox'
import {
  ArcticFetchError,
  CodeChallengeMethod,
  generateCodeVerifier,
  generateState,
  GitHub,
  Google,
  OAuth2Client,
  OAuth2RequestError,
  OAuth2Tokens,
  Spotify,
  UnexpectedErrorResponseBodyError,
} from 'arctic'
import type { ArcticClient, AuthConfig } from './providers'
export type { OauthProvider } from './providers'

const OAUTH2_STORAGE_KEY = 'oauth2'

type TokenStore = {
  access_token: string
  expires_at: number
  refresh_token?: string
  scopes?: string[]
}

export interface AuthFlowHandler {
  /**
   * Opens the authentication URL and returns the redirect URL with the code.
   * @param url The authorization URL to open
   */
  open(url: URL): Promise<URL>
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
   * Intentionally instantiates a new ArcticClient on every call rather than caching.
   * This ensures that if the underlying credentials (like settingsStore API keys)
   * change dynamically at runtime, the latest credentials are always used.
   * Instantiating these classes is virtually zero cost.
   */
  protected get _arcticClient(): ArcticClient {
    switch (this.provider.name) {
      case 'google':
      case 'google-health':
        return new Google(
          this.provider.clientId,
          this.provider.clientSecret || (null as unknown as string),
          this._redirectUrl
        )
      case 'spotify':
        return new Spotify(
          this.provider.clientId,
          this.provider.clientSecret || null,
          this._redirectUrl
        )
      case 'github':
        return new GitHub(
          this.provider.clientId,
          this.provider.clientSecret ?? '',
          this._redirectUrl
        )
      default:
        return new OAuth2Client(
          this.provider.clientId,
          this.provider.clientSecret || null,
          this._redirectUrl
        )
    }
  }

  get storageKey() {
    return `${OAUTH2_STORAGE_KEY}.${this.provider.name}`
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAuthToken()
      this._logger.debug('isAuthenticated?', !!token)
      return !!token
    } catch {
      return false
    }
  }

  static isExpired(token?: TokenStore) {
    return !token || Date.now() > token.expires_at - 60_000
  }

  async authenticate(
    requestedScopes?: string[],
    loginHint?: string
  ): Promise<boolean> {
    const token = await this.getAuthToken(true, requestedScopes, loginHint)
    return !!token
  }

  async deauthenticate(serverRevoke: boolean = false): Promise<boolean> {
    this._logger.log('deauthenticating')
    const token = await this.getAuthTokenFromStorage()
    // force revoke the token if serverRevoke is true
    // or if the provider does not skip server revocation
    if (token && (serverRevoke || !this.provider.skipServerRevoke)) {
      await this.revokeAuthToken(token.access_token)
    }
    await this.removeAuthTokenFromStorage()
    return true
  }

  async getAuthTokenFromStorage(): Promise<TokenStore | undefined> {
    const storeToken = this._storage.get<TokenStore>(this.storageKey)
    return storeToken
  }

  async getGrantedScopes(): Promise<string[]> {
    const storeToken = await this.getAuthTokenFromStorage()
    return storeToken?.scopes ?? []
  }

  async hasGrantedScopes(scopes: string[]): Promise<boolean> {
    const grantedScopes = await this.getGrantedScopes()
    return scopes.every((scope) => grantedScopes.includes(scope))
  }

  async revokeAuthToken(token: string) {
    try {
      if (this._arcticClient instanceof Google) {
        await this._arcticClient.revokeToken(token)
      } else {
        this._logger.warn(
          `Token revocation not implemented or supported for provider: ${this.provider.name}`
        )
      }
    } catch (e) {
      if (e instanceof OAuth2RequestError) {
        // Invalid tokens, credentials, or redirect URI
        const code = e.code
        this._logger.warn('Could not revoke token', {
          code,
          token,
        })
      } else if (e instanceof ArcticFetchError) {
        // Failed to call `fetch()`
        this._logger.error('Failed to revoke token', {
          e,
          token,
        })
      } else {
        this._logger.error('Unknown error while revoking token', {
          e,
          token,
        })
      }
    }
  }

  async removeAuthTokenFromStorage() {
    await this._storage.delete(this.storageKey)
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuth2Tokens | null> {
    if (!this.provider.clientId) {
      this._logger.warn('Cannot refresh token: client ID is not configured')
      return null
    }
    if (
      this._arcticClient instanceof Google ||
      this._arcticClient instanceof GitHub ||
      this._arcticClient instanceof Spotify
    ) {
      return this._arcticClient.refreshAccessToken(refreshToken)
    }
    return this._arcticClient.refreshAccessToken(
      this.provider.tokenEndpoint ?? '',
      refreshToken,
      this.provider.scopes
    )
  }

  protected isInvalidTokenError(error: unknown): boolean {
    if (error instanceof OAuth2RequestError && error.code === 'invalid_grant') {
      return true
    }
    if (error instanceof UnexpectedErrorResponseBodyError) {
      const errors = (error.data as Record<string, unknown>)?.errors
      if (
        Array.isArray(errors) &&
        errors.some(
          (e: Record<string, unknown>) => e?.errorType === 'invalid_grant'
        )
      ) {
        return true
      }
    }
    return false
  }

  private async tryRefreshToken(
    refresh_token: string
  ): Promise<string | undefined> {
    if (!this.provider.clientId) {
      this._logger.warn('Cannot refresh token: client ID is not configured')
      return undefined
    }
    this._logger.log('token expired, trying to refresh it')
    try {
      const newTokens = await this.refreshAccessToken(refresh_token)
      if (!newTokens) {
        throw new Error('Failed to refresh token - user must re-authenticate.')
      }

      const newAccessToken = newTokens.accessToken()
      this._logger.log('refreshed new access token, storing it and continue')

      const storeToken = await this.getAuthTokenFromStorage()

      await this.cacheAuthToken(
        newAccessToken,
        newTokens.hasRefreshToken() ? newTokens.refreshToken() : refresh_token,
        newTokens.accessTokenExpiresInSeconds(),
        newTokens.hasScopes() ? newTokens.scopes() : storeToken?.scopes
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
          return storeToken.access_token
        }

        if (storeToken.refresh_token) {
          return await this.tryRefreshToken(storeToken.refresh_token)
        }

        return undefined
      } finally {
        this._tokenPromise = null
      }
    })()

    return this._tokenPromise
  }

  async cacheAuthToken(
    access_token: string,
    refresh_token: string | undefined,
    expires_in_seconds: number,
    scopes?: string[]
  ) {
    const tokenStore: TokenStore = {
      access_token,
      refresh_token,
      expires_at: Date.now() + expires_in_seconds * 1000,
      scopes,
    }

    this._storage.set(this.storageKey, tokenStore)
  }

  get authStateKey() {
    return `${OAUTH2_STORAGE_KEY}.state.${this.provider.name}`
  }

  async createAuthUrl(
    requestedScopes: string[] = [],
    loginHint?: string
  ): Promise<URL | undefined> {
    this._state = generateState()
    this._codeVerifier = generateCodeVerifier()

    const previousScopes = await this.getGrantedScopes()
    const allScopes = Array.from(
      new Set([...this.provider.scopes, ...previousScopes, ...requestedScopes])
    )

    await this._storage.set(this.authStateKey, {
      state: this._state,
      codeVerifier: this._codeVerifier,
    })

    let url: URL
    if (this._arcticClient instanceof OAuth2Client) {
      url = this._arcticClient.createAuthorizationURLWithPKCE(
        this.provider.authEndpoint ?? '',
        this._state,
        CodeChallengeMethod.S256,
        this._codeVerifier,
        allScopes
      )
    } else if (
      this._arcticClient instanceof Google ||
      this._arcticClient instanceof Spotify
    ) {
      url = this._arcticClient.createAuthorizationURL(
        this._state,
        this._codeVerifier,
        allScopes
      )
      // add login_hint if provided, to pre-fill the email field in the Google login form
      if (loginHint) {
        url.searchParams.set('login_hint', loginHint ?? '')
      }
    } else if (this._arcticClient instanceof GitHub) {
      url = this._arcticClient.createAuthorizationURL(this._state, allScopes)
    } else {
      return undefined
    }

    if (this.provider.extraParams) {
      for (const [key, value] of Object.entries(this.provider.extraParams)) {
        url.searchParams.set(key, value)
      }
    }

    return url
  }

  async validate(code: string, state: string): Promise<OAuth2Tokens> {
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

    let tokens: OAuth2Tokens
    if (this._arcticClient instanceof OAuth2Client) {
      tokens = await this._arcticClient.validateAuthorizationCode(
        this.provider.tokenEndpoint ?? '',
        code,
        savedCodeVerifier
      )
    } else {
      tokens = await this._arcticClient.validateAuthorizationCode(
        code,
        savedCodeVerifier
      )
    }

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
      return this.handleRedirectFlow(url)
    }
  }

  private async handleRedirectFlow(url: URL): Promise<string | undefined> {
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

      const refreshToken = tokens.hasRefreshToken()
        ? tokens.refreshToken()
        : undefined
      let expiresIn = 31536000 // 1 year default for non-expiring tokens

      try {
        expiresIn = tokens.accessTokenExpiresInSeconds()
      } catch {
        this._logger.debug(
          'No expiry found for access token, using default 1 year expiry'
        )
      }

      let scopesToSave: string[] | undefined = undefined
      if (tokens.hasScopes()) {
        scopesToSave = tokens.scopes()
      } else {
        // If the provider doesn't return scopes, keep the ones we requested/know about
        scopesToSave = await this.getGrantedScopes()
      }

      await this.cacheAuthToken(
        tokens.accessToken(),
        refreshToken,
        expiresIn,
        scopesToSave
      )
      return tokens.accessToken()
    } catch (error) {
      this._logger.error('Auth flow failed', { error })
      return undefined
    }
  }
}
