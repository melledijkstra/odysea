import browser from 'webextension-polyfill'
import { Logger } from '@/logger'
import type { AuthProvider } from './providers'
import { base64encode, generateRandomString, sha256 } from './utils'
export type { OauthProvider } from './providers'

type BadAuthReason = 'invalid_token'

class AuthError extends Error {
  provider: string
  reason: BadAuthReason

  constructor(message: string, reason: BadAuthReason, provider: string) {
    super(message)
    this.name = 'AuthError'
    this.reason = reason
    this.provider = provider
  }
}

const OAUTH2_STORAGE_KEY = 'oauth2'

type TokenResponse = {
  access_token: string
  expires_in: number
  id_token: string
  refresh_token?: string
  scope?: string
  token_type?: string
}

type TokenStore = {
  access_token: string
  expires_at: number
  refresh_token: string
}

export class AuthClient {
  provider: AuthProvider
  logger: Logger

  constructor(provider: AuthProvider) {
    this.provider = provider
    this.logger = new Logger(`auth:${provider.name}`)
  }

  get storageKey() {
    return `${OAUTH2_STORAGE_KEY}.${this.provider.name}`
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAuthToken()
  
      this.logger.debug('isAuthenticated?', { token })
  
      return !!token
    } catch {
      return false
    }
  }

  static isExpired(token: TokenStore) {
    return Date.now() > token.expires_at - 60_000
  }

  async getAuthTokenChrome(interactive = false): Promise<string | undefined> {
    const oauth2 = await chrome.identity.getAuthToken({ interactive })
    return oauth2?.token
  }

  async deauthenticateChrome(): Promise<boolean> {
    const token = await this.getAuthTokenChrome(false)
    try {
      const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST'
      })
      if (response.ok) {
        this.logger.log('revoked token')
      } else {
        this.logger.error('failed to revoke token', response)
      }
    } catch (error) {
      this.logger.error('failed to revoke token', error)
    } finally {
      await chrome.identity.clearAllCachedAuthTokens()
      await this.removeAuthTokenFromStorage()
    }
    return true
  }

  async authenticate(): Promise<boolean> {
    const token = await this.getAuthToken(true)
    return !!token
  }

  async deauthenticate(): Promise<boolean> {
    this.logger.log('deauthenticating')
    if (this.provider.name === 'google' && typeof chrome !== 'undefined') {
      return await this.deauthenticateChrome()
    }

    await this.removeAuthTokenFromStorage()
    return true
  }

  async getAuthTokenFromStorage(): Promise<TokenStore | undefined> {
    const { [this.storageKey]: storeToken } = (await browser.storage.local.get(
      this.storageKey
    )) as {
      [key: string]: TokenStore | undefined
    }
    return storeToken
  }

  async removeAuthTokenFromStorage() {
    await browser.storage.local.remove(this.storageKey)
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<TokenResponse | null> {
    const config = this.provider

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.clientId,
        refresh_token: refreshToken
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      this.logger.error('Refresh token request failed:', errorBody)
      let parsedError: { error?: string } = {}
      try {
        parsedError = JSON.parse(errorBody)
      } catch {
        // ignore JSON parsing errors and rely on text search
      }
      if (parsedError.error === 'invalid_grant' || errorBody.includes('invalid_grant')) {
        throw new AuthError(
          `Failed to refresh token: ${errorBody}`,
          'invalid_token',
          this.provider.name
        )
      }
      return null
    }

    const tokenData = (await response.json()) as TokenResponse
    this.logger.log('refreshed token data', tokenData)

    return tokenData
  }

  async getTokenFromStoreOrRefreshToken(): Promise<string | undefined> {
    const storeToken = await this.getAuthTokenFromStorage()

    let { access_token } = storeToken ?? {};
    const { refresh_token, expires_at } = storeToken ?? {}

    this.logger.debug('token in storage?', { storeToken })

    // Subtract some buffer (60 seconds) to ensure we refresh before actual expiry
    const isTokenExpired = !expires_at || Date.now() > expires_at - 60_000

    if (isTokenExpired && refresh_token) {
      try {
        this.logger.log('token expired, trying to refresh it')
        // Refresh the token
        const newTokens = await this.refreshAccessToken(refresh_token)

        if (!newTokens) {
          throw new Error(
            'Failed to refresh token - user must re-authenticate.'
          )
        }

        access_token = newTokens.access_token
        this.logger.log('refreshed new access token, storing it and continue')
        this.cacheAuthToken(
          newTokens.access_token,
          // if provider doesn’t return a new refresh token, keep the old one
          newTokens.refresh_token ?? refresh_token,
          newTokens.expires_in
        )
      } catch (error) {
        if (error instanceof AuthError && error.reason === 'invalid_token') {
          // if the error is an AuthError, remove the stored token
          // so that the user can re-authenticate
          await browser.storage.local.remove(this.storageKey)
          this.getAuthToken()
        }
      }
    }

    return access_token
  }

  async cacheAuthToken(
    access_token: string,
    refresh_token: string,
    expires_in: number
  ) {
    const tokenStore: TokenStore = {
      access_token,
      refresh_token,
      expires_at: Date.now() + expires_in * 1000
    }

    await browser.storage.local.set({
      [this.storageKey]: tokenStore
    })
  }

  async getAuthToken(interactive = false): Promise<string | undefined> {
    if (this.provider.name === 'google' && typeof chrome !== 'undefined') {
      // if we are on chrome browser then use the preferred auth token
      // method that is already build in
      try {
        this.logger.debug(
          'trying to retrieve oauth token using build in functionality'
        )
        const token = await this.getAuthTokenChrome(interactive)
        if (token) {
          return token
        }
      } catch (error) {
        this.logger.warn(
          `${this.provider.name}: No luck retrieving oauth token using build in functionality, trying manually`,
          error
        )
      }
    }

    const config = this.provider

    const storedToken = await this.getTokenFromStoreOrRefreshToken()

    if (storedToken) {
      this.logger.debug('we have a refreshed or stored token, lets use it', {
        storedToken
      })
      return storedToken
    } else if (!interactive) {
      this.logger.debug(
        'no token retrieved, but not interactive, so returning nothing'
      )
      return
    }

    this.logger.log(
      'no token retrieved in any way, continue with normal oauth2 flow...'
    )

    const redirectUrl = browser.identity.getRedirectURL()
    const state = generateRandomString(16)
    const codeVerifier = generateRandomString(64)
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed)

    const queryParams = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      scope: config.scopes.join(' '),
      redirect_uri: redirectUrl,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: state
    })

    const authUrl = new URL(config.authEndpoint)
    authUrl.search = queryParams.toString()

    this.logger.log({
      redirectUrl,
      authUrl: authUrl.toString()
    })

    const responseUrl = await browser.identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive
    })

    this.logger.log('responseUrl', responseUrl)

    if (browser.runtime.lastError || !responseUrl) {
      this.logger.error(
        'Error during authentication:',
        browser.runtime.lastError
      )
      return
    }

    const responseParams = new URL(responseUrl).searchParams
    const authCode = responseParams.get('code')
    const responseError = responseParams.get('error')
    const responseState = responseParams.get('state')

    this.logger.log('auth code', authCode)

    if (responseError) {
      this.logger.error('Error during authentication:', responseError)
      return
    }

    if (!authCode || state !== responseState) {
      this.logger.error('No auth code found or state mismatch!')
      return
    }

    try {
      const tokenResponse = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: redirectUrl,
          client_id: config.clientId,
          code_verifier: codeVerifier
        })
      })

      const tokenData = (await tokenResponse.json()) as TokenResponse

      if (tokenData.refresh_token) {
        this.cacheAuthToken(
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in
        )
      }

      return tokenData.access_token
    } catch (error) {
      this.logger.error('Token exchange failed:', error)
    }
  }
}
