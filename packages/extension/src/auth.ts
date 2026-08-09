import * as browser from 'webextension-polyfill'
import {
  AuthConfig,
  AuthClient as BaseAuthClient,
  AuthFlowHandler,
} from '@melledijkstra/auth'
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
    const redirectUrl = browser.identity.getRedirectURL(provider?.redirectPath)
    super(provider, redirectUrl, {
      storage: new ExtensionStorage(),
      handler: new ExtensionAuthFlowHandler(),
    })
  }
}
