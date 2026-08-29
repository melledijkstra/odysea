import { describe, it, expect, vi } from 'vitest'
import { ExtensionAuthFlowHandler } from './auth'
import * as browser from 'webextension-polyfill'

describe('Extension AuthFlowHandler', () => {
  it('should create an instance of ExtensionAuthFlowHandler and call webAuthFlow', async () => {
    browser.identity.launchWebAuthFlow = vi.fn().mockResolvedValue('https://example.com/callback')

    const handler = new ExtensionAuthFlowHandler()
    expect(handler).toBeInstanceOf(ExtensionAuthFlowHandler)

    const testUrl = new URL('https://example.com/auth')
    const result = await handler.open(testUrl)

    expect(browser.identity.launchWebAuthFlow).toHaveBeenCalledWith({
      url: testUrl.toString(),
      interactive: true
    })
    expect(result.toString()).toBe('https://example.com/callback')
  })
})
