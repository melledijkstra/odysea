import * as browser from 'webextension-polyfill'
import { AuthClient, AuthConfig } from '@melledijkstra/auth'
import { ExtensionStorage } from './storage'
import { ExtensionAuthFlowHandler } from './auth-flow-handler'

export class ExtensionAuthClient extends AuthClient {
  constructor(config: AuthConfig) {
    super(config, browser.identity.getRedirectURL(config.redirectPath), {
      storage: new ExtensionStorage(),
      handler: new ExtensionAuthFlowHandler(),
    })
  }
}
