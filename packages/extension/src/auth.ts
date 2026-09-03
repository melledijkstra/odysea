import * as browser from 'webextension-polyfill'
import type { AuthEnvironmentOptions } from '@melledijkstra/auth'
import { ExtensionStorage } from './storage'
import { ExtensionAuthFlowHandler } from './auth-flow-handler'

export interface ExtensionAuthOptions {
  redirectPath?: string
}

export function extensionAuth({
  redirectPath,
}: ExtensionAuthOptions = {}): AuthEnvironmentOptions {
  return {
    redirectUrl: browser.identity.getRedirectURL(redirectPath),
    storage: new ExtensionStorage(),
    handler: new ExtensionAuthFlowHandler(),
  }
}
