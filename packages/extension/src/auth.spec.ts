import { AuthConfig } from '@melledijkstra/auth'
import { AuthClient } from './auth'
import * as browser from 'webextension-polyfill'

describe('Extension AuthClient', () => {
  it('should create an instance of AuthClient', async () => {
    browser.storage.local.get = vi.fn().mockResolvedValue({})

    const provider: AuthConfig = {
      name: 'google',
      clientId: 'test-client-id',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      scopes: ['openid', 'profile', 'email'],
    }
    const authClient = new AuthClient(provider)
    expect(authClient).toBeInstanceOf(AuthClient)

    const result = await authClient.getAuthToken()

    expect(result).toBeUndefined()
  })
})
