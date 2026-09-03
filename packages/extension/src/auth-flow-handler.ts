import { AuthFlowHandler } from '@melledijkstra/auth'
import * as browser from 'webextension-polyfill'

export class ExtensionAuthFlowHandler implements AuthFlowHandler {
  async open(url: URL, interactive = true): Promise<URL> {
    const resultUrl = await browser.identity.launchWebAuthFlow({
      url: url.toString(),
      interactive,
    })
    return new URL(resultUrl)
  }
}
