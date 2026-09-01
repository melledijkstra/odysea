import { describe, it, expect, vi } from 'vitest'
import { ExtensionAuthClient } from './auth'
import * as browser from 'webextension-polyfill'

describe('ExtensionAuthClient', () => {
  it('should initialize with extension storage and flow handler', () => {
    browser.identity.getRedirectURL = vi
      .fn()
      .mockReturnValue('https://extension.example/callback')

    const client = new ExtensionAuthClient({
      name: 'google',
      clientId: 'test-client',
      redirectPath: 'google',
    })

    expect(client).toBeInstanceOf(ExtensionAuthClient)
    expect(client.name).toBe('google')
    expect(browser.identity.getRedirectURL).toHaveBeenCalledWith('google')
  })
})
