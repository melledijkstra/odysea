import * as browser from 'webextension-polyfill'
import {
  AuthConfig,
  AuthClient as BaseAuthClient,
  AuthFlowHandler,
} from '@melledijkstra/auth'
import { ExtensionStorage } from './storage'

export class ExtensionAuthFlowHandler implements AuthFlowHandler {
  async open(url: URL): Promise<URL> {
    const resultUrl = await browser.identity.launchWebAuthFlow({
      url: url.toString(),
      interactive: true,
    })
    return new URL(resultUrl)
  }
}
