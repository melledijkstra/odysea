import { IStorage, MemoryCache } from '@melledijkstra/storage'
import { Logger } from '@melledijkstra/toolbox'
import {
  OAuth2Client,
  OAuth2Error,
  OAuth2Token,
  generateCodeVerifier,
} from '@badgateway/oauth2-client'
import type { AuthConfig } from './config'
import type { AuthFlowHandler } from './flows/flow.interface'

const OAUTH2_STORAGE_KEY = 'oauth2'

export interface AuthEnvironmentOptions {
  redirectUrl?: string
  storage?: IStorage
  handler?: AuthFlowHandler
}

export class AuthClient {
  public readonly name: string
  public readonly config: AuthConfig
  protected readonly _redirectUrl: string
  protected readonly _storage: IStorage
  // TODO: make handler required, we need a way to handle the case when no handler is provided
  // perhaps set a default calculated based on available environment
  // or force the consumer to always provide one.
  protected readonly _handler?: AuthFlowHandler
  protected readonly _logger: Logger
  protected _tokenPromise: Promise<OAuth2Token | undefined> | null = null
  protected _oauth2Client: OAuth2Client

  constructor(
    name: string,
    config: AuthConfig,
    options: AuthEnvironmentOptions = {}
  ) {
    this.name = name
    this.config = config
    this._redirectUrl = options.redirectUrl ?? ''
    this._storage = options.storage ?? new MemoryCache()
    this._handler = options.handler
    this._logger = new Logger(`auth:${name}`)

    this._oauth2Client = new OAuth2Client({
      ...this.config,
    })
  }

  get extraParams(): Record<string, string> {
    return {
      ...this.config.extraParams,
    }
  }

  get initialScope(): string[] {
    return this.config.initialScope ?? []
  }

  get storageKey(): string {
    return `${OAUTH2_STORAGE_KEY}.${this.name}`
  }

  get authStateKey(): string {
    return `${OAUTH2_STORAGE_KEY}.state.${this.name}`
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthTokenFromStorage()
    return !!token
  }

  async hasGrantedScopes(scopes: string[]): Promise<boolean> {
    const grantedScopes = await this.getGrantedScopes()
    return scopes.every((scope) => grantedScopes.includes(scope))
  }

  protected generateState(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }

    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }

  static isExpired(token: OAuth2Token): boolean {
    if (!token.expiresAt) return false
    // Subtract 1 minute to avoid edge-case expiry during flight
    return Date.now() >= token.expiresAt - 60000
  }

  async getAuthTokenFromStorage(): Promise<OAuth2Token | undefined> {
    return this._storage.get<OAuth2Token>(this.storageKey)
  }

  async getGrantedScopes(): Promise<string[]> {
    const token = await this.getAuthTokenFromStorage()
    return token?.scope || []
  }

  async revokeToken(): Promise<void> {
    const tokenStore = await this.getAuthTokenFromStorage()

    if (!tokenStore) {
      this._logger.warn('Could not revoke token: not authenticated')
      return
    }

    this._logger.debug('revoke token starting')

    await this.removeAuthTokenFromStorage()

    const skipServerRevoke = this.config.skipServerRevoke ?? false

    if (skipServerRevoke) {
      this._logger.debug('skipping server revoke for this provider')
      return
    }

    try {
      await this._oauth2Client.revoke(tokenStore)
      this._logger.log('Server side revoke completed')
    } catch (e) {
      this._logger.error('Unknown error while revoking token on server', { e })
    }
  }

  async removeAuthTokenFromStorage(): Promise<void> {
    await this._storage.delete(this.storageKey)
  }

  async refreshAccessToken(tokenStore: OAuth2Token): Promise<OAuth2Token> {
    if (!this.config.clientId) {
      throw new Error('Cannot refresh token: client ID is not configured')
    }

    return await this._oauth2Client.refreshToken(tokenStore)
  }

  protected isInvalidTokenError(error: unknown): boolean {
    if (error instanceof OAuth2Error) {
      return error.oauth2Code === 'invalid_grant'
    }
    return String(error).includes('invalid_grant')
  }

  private async tryRefreshToken(
    tokenStore: OAuth2Token
  ): Promise<OAuth2Token | undefined> {
    if (!this.config.clientId) {
      this._logger.warn('Cannot refresh token: client ID is not configured')
      return undefined
    }
    this._logger.log('token expired, trying to refresh it')
    try {
      const newTokens = await this.refreshAccessToken(tokenStore)
      this._logger.log('refreshed new access token, storing it and continue')

      await this.cacheAuthToken(
        newTokens.accessToken,
        newTokens.refreshToken ?? tokenStore.refreshToken,
        newTokens.expiresAt,
        newTokens.scope ?? tokenStore.scope
      )

      return newTokens
    } catch (error) {
      if (this.isInvalidTokenError(error)) {
        this._logger.warn('Refresh token is invalid, clearing storage')
        await this.removeAuthTokenFromStorage()
      } else {
        this._logger.error('Failed to refresh access token', { error })
      }
      return undefined
    }
  }

  async getTokenFromStoreOrRefreshToken(): Promise<OAuth2Token | undefined> {
    if (this._tokenPromise) {
      this._logger.debug(
        'token retrieval already in progress, returning pending promise'
      )
      return this._tokenPromise
    }

    this._tokenPromise = (async () => {
      try {
        const tokenStore = await this.getAuthTokenFromStorage()
        this._logger.debug('token in storage?', !!tokenStore)

        if (!tokenStore) return undefined

        if (!AuthClient.isExpired(tokenStore)) {
          return tokenStore
        }

        if (tokenStore.refreshToken) {
          return await this.tryRefreshToken(tokenStore)
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
    scope?: string[]
  ): Promise<void> {
    const tokenStore: OAuth2Token = {
      accessToken,
      refreshToken,
      expiresAt,
      scope,
    }

    await this._storage.set(this.storageKey, tokenStore)
  }

  async createAuthUrl(
    requestedScopes: string[] = [],
    loginHint?: string
  ): Promise<URL | undefined> {
    if (!this._redirectUrl) {
      throw new Error('Redirect URL is required to create auth URL')
    }

    const state = this.generateState()
    const codeVerifier = await generateCodeVerifier()

    const previousScopes = await this.getGrantedScopes()
    const allScopes = Array.from(
      new Set([...this.initialScope, ...previousScopes, ...requestedScopes])
    )

    await this._storage.set(this.authStateKey, {
      state,
      codeVerifier,
    })

    const url = await this._oauth2Client.authorizationCode.getAuthorizeUri({
      redirectUri: this._redirectUrl,
      state,
      codeVerifier,
      scope: allScopes,
      extraParams: this.extraParams,
    })

    const finalUrl = new URL(url)

    if (loginHint) {
      finalUrl.searchParams.set('login_hint', loginHint)
    }

    return finalUrl
  }

  async validate(code: string, state: string): Promise<OAuth2Token> {
    if (!this._redirectUrl) {
      throw new Error('Redirect URL is required to validate OAuth token')
    }

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

    const tokens = await this._oauth2Client.authorizationCode.getToken({
      code,
      redirectUri: this._redirectUrl,
      state,
      codeVerifier: savedCodeVerifier,
    })

    await this._storage.delete(this.authStateKey)

    return tokens
  }

  async getAuthToken(
    interactive = false,
    requestedScopes?: string[],
    loginHint?: string
  ): Promise<string | undefined> {
    const storedToken = await this.getTokenFromStoreOrRefreshToken()
    const grantedScopes = await this.getGrantedScopes()

    const hasAllRequestedScopes = requestedScopes
      ? requestedScopes.every((scope) => grantedScopes.includes(scope))
      : true

    if (storedToken && hasAllRequestedScopes) {
      this._logger.log('using stored token with all necessary scopes')
      return storedToken.accessToken
    } else if (!interactive && !hasAllRequestedScopes) {
      this._logger.log(
        'missing requested scopes but not interactive, returning nothing'
      )
      return undefined
    } else if (!interactive && !storedToken) {
      this._logger.log(
        'no token retrieved, but not interactive, so returning nothing'
      )
      return undefined
    }

    this._logger.log(
      'no token retrieved or missing scopes, continue with normal oauth2 flow...'
    )

    const url = await this.createAuthUrl(requestedScopes, loginHint)

    if (!url) {
      this._logger.error('Failed to create auth URL')
      return undefined
    }

    this._logger.debug('Generated Auth URL:', url.href, {
      provider: this.name,
      scopes: requestedScopes,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret ? '***' : undefined,
    })

    if (this._handler) {
      return this.handleRedirectFlow(url, requestedScopes)
    }
  }

  private async handleRedirectFlow(
    url: URL,
    requestedScopes: string[] = []
  ): Promise<string | undefined> {
    if (!this._handler) {
      const msg = 'No auth flow handler configured!'
      this._logger.error(msg)
      throw new Error(msg)
    }

    try {
      const redirectUrl = await this._handler.open(url)
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

      // If token response returned scopes, use them; otherwise union granted + requested
      const scopesToSave =
        tokens.scope && tokens.scope.length > 0
          ? tokens.scope
          : Array.from(
              new Set([...(await this.getGrantedScopes()), ...requestedScopes])
            )

      await this.cacheAuthToken(
        tokens.accessToken,
        refreshToken,
        tokens.expiresAt,
        scopesToSave
      )
      return tokens.accessToken
    } catch (error) {
      this._logger.error('Auth flow failed', { error })
      throw error
    }
  }
}
