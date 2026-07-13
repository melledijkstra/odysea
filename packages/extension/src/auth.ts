import * as browser from 'webextension-polyfill'
import { AuthConfig, AuthClient as BaseAuthClient, AuthFlowHandler } from '@melledijkstra/auth'
import { ExtensionStorage } from './storage'

class ExtensionAuthFlowHandler implements AuthFlowHandler {
  async open(url: URL): Promise<URL> {
    const resultUrl = await browser.identity.launchWebAuthFlow({
      url: url.toString(),
      interactive: true,
    })
    return new URL(resultUrl)
  }
}

export class AuthClient extends BaseAuthClient {
  constructor(provider: AuthConfig) {
    const redirectUrl = browser.identity.getRedirectURL()
    super(provider, redirectUrl, {
      storage: new ExtensionStorage(),
      handler: new ExtensionAuthFlowHandler(),
    })
  }

  async getAuthTokenChrome(interactive = false): Promise<string | undefined> {
    const oauth2 = await chrome.identity.getAuthToken({ interactive })
    return oauth2?.token
  }

  async deauthenticateChrome(): Promise<boolean> {
    const token = await this.getAuthTokenChrome(false)
    if (token) {
      try {
        const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST',
        })
        if (response.ok) {
          this._logger.log('revoked token')
        }
        else {
          this._logger.error('failed to revoke token', response)
        }
      }
      catch (error) {
        this._logger.error('failed to revoke token', error)
      }
    }
    await chrome.identity.clearAllCachedAuthTokens()
    await this.removeAuthTokenFromStorage()
    return true
  }

  async getAuthToken(interactive = false): Promise<string | undefined> {
    if (this.provider.name === 'google' && typeof chrome !== 'undefined' && chrome.identity) {
      try {
        this._logger.debug('trying to retrieve oauth token using build in functionality')
        const token = await this.getAuthTokenChrome(interactive)
        if (token) return token
      }
      catch (error) {
        this._logger.warn(`${this.provider.name}: No luck retrieving oauth token using build in functionality, trying manually`, error)
      }
    }

    return super.getAuthToken(interactive)
  }

  async deauthenticate(): Promise<boolean> {
    this._logger.log('deauthenticating')
    if (this.provider.name === 'google' && typeof chrome !== 'undefined' && chrome.identity) {
      return await this.deauthenticateChrome()
    }
    return super.deauthenticate()
  }
}
