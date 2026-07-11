import { IStorage, MemoryCache } from '@melledijkstra/storage'
import { Logger } from '@melledijkstra/toolbox'
import { ArcticFetchError, CodeChallengeMethod, generateCodeVerifier, generateState, GitHub, Google, OAuth2Client, OAuth2RequestError, OAuth2Tokens, Spotify, UnexpectedErrorResponseBodyError } from 'arctic'
import type { ArcticClient, AuthConfig } from './providers'
export type { OauthProvider } from './providers'

const OAUTH2_STORAGE_KEY = 'oauth2'

type TokenStore = {
  access_token: string
  expires_at: number
  refresh_token?: string
}

export interface AuthFlowHandler {
  /**
   * Opens the authentication URL and returns the redirect URL with the code.
   * @param url The authorization URL to open
   */
  open(url: URL): Promise<URL>
}

export class AuthClient {
  protected _arcticClient: ArcticClient
  protected _storage: IStorage
  protected _state: string | undefined
  protected _codeVerifier: string | undefined
  protected _logger: Logger
  protected _handler: AuthFlowHandler | undefined
  protected _tokenPromise: Promise<string | undefined> | null = null
  provider: AuthConfig

  constructor(provider: AuthConfig, redirectUrl: string, {
    storage = new MemoryCache(),
    handler,
  }: {
    storage?: IStorage
    handler?: AuthFlowHandler
  } = {}) {
    this._logger = new Logger(`auth:${provider.name}`)
    this.provider = provider
    this._storage = storage
    this._handler = handler
    switch (provider.name) {
      case 'google':
        this._arcticClient = new Google(provider.clientId, provider.clientSecret ?? '', redirectUrl)
        break
      case 'spotify':
        this._arcticClient = new Spotify(provider.clientId, provider.clientSecret ?? null, redirectUrl)
        break
      case 'github':
        this._arcticClient = new GitHub(provider.clientId, provider.clientSecret ?? '', redirectUrl)
        break
      case 'fitbit':
      default:
        this._arcticClient = new OAuth2Client(provider.clientId, provider.clientSecret ?? null, redirectUrl)
        break
    }
  }

  get storageKey() {
    return `${OAUTH2_STORAGE_KEY}.${this.provider.name}`
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAuthToken()
      return !!token
    }
    catch {
      return false
    }
  }

  static isExpired(token?: TokenStore) {
    return !token || Date.now() > token.expires_at - 60_000
  }

  async authenticate(): Promise<boolean> {
    const token = await this.getAuthToken()
    return !!token
  }

  async deauthenticate(): Promise<boolean> {
    this._logger.log('deauthenticating')
    const token = await this.getAuthTokenFromStorage()
    if (token) {
      await this.revokeAuthToken(token.access_token)
    }
    await this.removeAuthTokenFromStorage()
    return true
  }

  async getAuthTokenFromStorage(): Promise<TokenStore | undefined> {
    const storeToken = this._storage.get<TokenStore>(this.storageKey)
    return storeToken
  }

  async revokeAuthToken(token: string) {
    try {
      if (this._arcticClient instanceof Google) {
        await this._arcticClient.revokeToken(token)
      }
      else {
        this._logger.warn(`Token revocation not implemented or supported for provider: ${this.provider.name}`)
      }
    }
    catch (e) {
      if (e instanceof OAuth2RequestError) {
        // Invalid tokens, credentials, or redirect URI
        const code = e.code
        this._logger.warn('Could not revoke token', {
          code,
          token,
        })
      }
      else if (e instanceof ArcticFetchError) {
        // Failed to call `fetch()`
        this._logger.error('Failed to revoke token', {
          e,
          token,
        })
      }
      else {
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

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<OAuth2Tokens | null> {
    if (this._arcticClient instanceof Google
      || this._arcticClient instanceof GitHub
      || this._arcticClient instanceof Spotify
    ) {
      return this._arcticClient.refreshAccessToken(refreshToken)
    }
    return this._arcticClient.refreshAccessToken(this.provider.tokenEndpoint ?? '', refreshToken, this.provider.scopes)
  }

  protected isInvalidTokenError(error: unknown): boolean {
    if (error instanceof OAuth2RequestError && error.code === 'invalid_grant') {
      return true
    }
    if (
      error instanceof UnexpectedErrorResponseBodyError
      && error.data
      && typeof error.data === 'object'
      && 'errors' in error.data
      && Array.isArray(error.data?.errors)
    ) {
      const errors: Array<{ errorType: string, message: string }> = error.data.errors
      if (errors.some(e => e.errorType === 'invalid_grant')) {
        return true
      }
    }
    return false
  }

  async getTokenFromStoreOrRefreshToken(): Promise<string | undefined> {
    if (this._tokenPromise) {
      this._logger.log('token retrieval already in progress, returning pending promise')
      return this._tokenPromise
    }

    this._tokenPromise = (async () => {
      try {
        const storeToken = await this.getAuthTokenFromStorage()
        let access_token = storeToken?.access_token

        this._logger.debug('token in storage?', !!storeToken)

        // Subtract some buffer (60 seconds) to ensure we refresh before actual expiry
        const isTokenExpired = AuthClient.isExpired(storeToken)

        const { refresh_token } = storeToken ?? {}

        if (isTokenExpired && refresh_token) {
          try {
            this._logger.log('token expired, trying to refresh it')
            // Refresh the token
            const newTokens = await this.refreshAccessToken(refresh_token)

            if (!newTokens) {
              throw new Error(
                'Failed to refresh token - user must re-authenticate.',
              )
            }

            const newAccessToken = newTokens.accessToken()
            this._logger.log('refreshed new access token, storing it and continue')
            await this.cacheAuthToken(
              newAccessToken,
              // if provider doesn't return a new refresh token, keep the old one
              newTokens.hasRefreshToken() ? newTokens.refreshToken() : refresh_token,
              newTokens.accessTokenExpiresInSeconds(),
            )
            access_token = newAccessToken
          }
          catch (error) {
            if (this.isInvalidTokenError(error)) {
              this._logger.warn('Refresh token is invalid, clearing storage')
              // remove the stored token so that the user can re-authenticate
              await this._storage.delete(this.storageKey)
              access_token = undefined
            }
            else {
              this._logger.error('Failed to refresh access token', { error })
            }
          }
        }

        return access_token
      }
      finally {
        this._tokenPromise = null
      }
    })()

    return this._tokenPromise
  }

  async cacheAuthToken(
    access_token: string,
    refresh_token: string | undefined,
    expires_in_seconds: number,
  ) {
    const tokenStore: TokenStore = {
      access_token,
      refresh_token,
      expires_at: Date.now() + expires_in_seconds * 1000,
    }

    this._storage.set(this.storageKey, tokenStore)
  }

  get authStateKey() {
    return `${OAUTH2_STORAGE_KEY}.state.${this.provider.name}`
  }

  async createAuthUrl(): Promise<URL | undefined> {
    this._state = generateState()
    this._codeVerifier = generateCodeVerifier()
    const { scopes } = this.provider

    await this._storage.set(this.authStateKey, {
      state: this._state,
      codeVerifier: this._codeVerifier,
    })

    let url: URL
    if (this._arcticClient instanceof OAuth2Client) {
      url = this._arcticClient.createAuthorizationURLWithPKCE(
        this.provider.authEndpoint ?? '', this._state, CodeChallengeMethod.S256,
        this._codeVerifier, scopes,
      )
    }
    else if (this._arcticClient instanceof Google
      || this._arcticClient instanceof Spotify) {
      url = this._arcticClient.createAuthorizationURL(this._state, this._codeVerifier, scopes)
    }
    else if (this._arcticClient instanceof GitHub) {
      url = this._arcticClient.createAuthorizationURL(this._state, scopes)
    }
    else {
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
    const storedState = await this._storage.get<{ state: string, codeVerifier: string }>(this.authStateKey)
    const { state: savedState, codeVerifier: savedCodeVerifier } = storedState ?? {}

    if (!code || !savedState || state !== savedState || !savedCodeVerifier) {
      throw new Error('Code or state mismatch')
    }

    this._logger.log({
      code,
      savedCode: savedCodeVerifier,
    })

    let tokens: OAuth2Tokens
    if (this._arcticClient instanceof OAuth2Client) {
      tokens = await this._arcticClient.validateAuthorizationCode(this.provider.tokenEndpoint ?? '', code, savedCodeVerifier)
    }
    else {
      tokens = await this._arcticClient.validateAuthorizationCode(code, savedCodeVerifier)
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

  async getAuthToken(interactive = false): Promise<string | undefined> {
    const storedToken = await this.getTokenFromStoreOrRefreshToken()

    if (storedToken) {
      this._logger.log('using stored token')
      return storedToken
    }
    else if (!interactive) {
      this._logger.log(
        'no token retrieved, but not interactive, so returning nothing',
      )
      return
    }

    this._logger.log(
      'no token retrieved in any way, continue with normal oauth2 flow...',
    )

    const url = await this.createAuthUrl()

    if (!url) {
      this._logger.error('Failed to create auth URL')
      return
    }

    this._logger.log('Generated Auth URL:', url.href)

    if (this._handler) {
      try {
        const redirectUrl = await this._handler.open(url)
        const code = redirectUrl.searchParams.get('code')
        const state = redirectUrl.searchParams.get('state')

        if (code && state) {
          const tokens = await this.validate(code, state)
          if (!tokens.hasRefreshToken()) {
            throw new Error(`Provider '${this.provider.name}' did not return a refresh token.`)
          }
          // Store the tokens
          await this.cacheAuthToken(
            tokens.accessToken(),
            tokens.refreshToken(),
            tokens.accessTokenExpiresInSeconds(),
          )
          return tokens.accessToken()
        }
        else {
          this._logger.error('Redirect URL missing code or state', { href: redirectUrl.href })
        }
      }
      catch (error) {
        this._logger.error('Auth flow failed', { error })
      }
    }
  }
}
