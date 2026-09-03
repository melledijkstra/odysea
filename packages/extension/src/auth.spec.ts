import { describe, it, expect, vi } from 'vitest'
import { extensionAuth } from './auth'
import { ExtensionStorage } from './storage'
import { ExtensionAuthFlowHandler } from './auth-flow-handler'
import * as browser from 'webextension-polyfill'

describe('extensionAuth', () => {
  it('should return environment options with extension storage and flow handler', () => {
    browser.identity.getRedirectURL = vi
      .fn()
      .mockReturnValue('https://extension.example/callback')

    const options = extensionAuth({ redirectPath: 'google' })

    expect(browser.identity.getRedirectURL).toHaveBeenCalledWith('google')
    expect(options.redirectUrl).toBe('https://extension.example/callback')
    expect(options.storage).toBeInstanceOf(ExtensionStorage)
    expect(options.handler).toBeInstanceOf(ExtensionAuthFlowHandler)
  })

  it('should support default empty options', () => {
    browser.identity.getRedirectURL = vi
      .fn()
      .mockReturnValue('https://extension.example/callback')

    const options = extensionAuth()

    expect(browser.identity.getRedirectURL).toHaveBeenCalledWith(undefined)
    expect(options.redirectUrl).toBe('https://extension.example/callback')
  })
})
