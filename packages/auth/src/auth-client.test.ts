import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthClient } from './auth-client'
import { GoogleAuthClient } from './providers'
import type { AuthConfig } from './config'
import type { AuthFlowHandler } from './flows'
import { MemoryCache } from '@melledijkstra/storage'
import { OAuth2Token } from '@badgateway/oauth2-client'

vi.mock('@melledijkstra/storage', () => {
  return {
    MemoryCache: class MemoryCacheMock {
      private store: Record<string, unknown> = {}
      get = vi.fn((key: string) => this.store[key])
      set = vi.fn((key: string, value: unknown) => {
        this.store[key] = value
      })
      delete = vi.fn((key: string) => {
        delete this.store[key]
      })
      clear = vi.fn(() => {
        this.store = {}
      })
    },
  }
})

vi.mock('@badgateway/oauth2-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@badgateway/oauth2-client')>()
  return {
    ...actual,
    generateCodeVerifier: vi.fn().mockResolvedValue('mocked_code_verifier'),
    OAuth2Client: class {
      refreshToken = vi.fn()
      revoke = vi.fn().mockResolvedValue(undefined)
      authorizationCode = {
        getAuthorizeUri: vi
          .fn()
          .mockResolvedValue(
            'https://accounts.google.com/o/oauth2/v2/auth?state=mockstate'
          ),
        getToken: vi.fn(),
      }
    },
  }
})

describe('AuthClient', () => {
  let storage: MemoryCache
  let handler: AuthFlowHandler
  let client: AuthClient
  let config: AuthConfig

  beforeEach(() => {
    vi.clearAllMocks()
    storage = new MemoryCache()
    handler = {
      open: vi.fn(),
    }

    process.env.GOOGLE_CLIENT_ID = 'test-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'

    config = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    }

    client = new AuthClient('google', config, {
      storage,
      handler,
      redirectUrl: 'http://localhost/callback',
    })
  })

  it('should be authenticated if a valid token is in storage', async () => {
    vi.spyOn(storage, 'get').mockResolvedValue({
      accessToken: 'valid_token',
      expiresAt: Date.now() + 65000,
    })

    const isAuthenticated = await client.isAuthenticated()
    expect(isAuthenticated).toBe(true)
  })

  it('should not be authenticated if storage is empty', async () => {
    vi.spyOn(storage, 'get').mockResolvedValue(undefined)

    const isAuthenticated = await client.isAuthenticated()
    expect(isAuthenticated).toBe(false)
  })

  describe('token management (getTokenFromStoreOrRefreshToken)', () => {
    it('should return undefined if no token in storage', async () => {
      vi.spyOn(storage, 'get').mockResolvedValue(undefined)
      const token = await client.getTokenFromStoreOrRefreshToken()
      expect(token).toBeUndefined()
    })

    it('should return access token if it is not expired', async () => {
      const mockStore: OAuth2Token = {
        accessToken: 'valid-token',
        expiresAt: Date.now() + 65000,
        refreshToken: '',
      }
      vi.spyOn(client, 'getAuthTokenFromStorage').mockResolvedValueOnce(
        mockStore
      )

      const token = await client.getTokenFromStoreOrRefreshToken()

      expect(token?.accessToken).toBe('valid-token')
    })

    it('should return undefined and delete from storage if expired and no refresh token exists', async () => {
      const mockStore: OAuth2Token = {
        accessToken: 'expired-token',
        expiresAt: Date.now() - 10000,
        refreshToken: '',
      }
      vi.spyOn(client, 'getAuthTokenFromStorage').mockResolvedValueOnce(
        mockStore
      )

      const token = await client.getTokenFromStoreOrRefreshToken()
      expect(token).toBeUndefined()
    })

    it('should refresh token if expired but refresh_token exists', async () => {
      const mockStore: OAuth2Token = {
        accessToken: 'expired-token',
        expiresAt: Date.now() - 10000,
        refreshToken: 'old-refresh-token',
        scope: ['profile', 'email'],
      }
      vi.spyOn(client, 'getAuthTokenFromStorage').mockResolvedValue(mockStore)

      const mockTokens: OAuth2Token = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: Date.now() + 3600000,
        scope: ['profile', 'email'],
      }

      vi.spyOn(client, 'refreshAccessToken').mockResolvedValue(mockTokens)
      vi.spyOn(client, 'cacheAuthToken').mockResolvedValueOnce(undefined)

      const token = await client.getTokenFromStoreOrRefreshToken()

      expect(client.cacheAuthToken).toHaveBeenCalledWith(
        'new-access-token',
        'new-refresh-token',
        expect.any(Number),
        ['profile', 'email']
      )
      expect(token?.accessToken).toBe('new-access-token')
    })
  })

  describe('authentication flows (getAuthToken)', () => {
    it('should return stored token if available', async () => {
      vi.spyOn(client, 'getTokenFromStoreOrRefreshToken').mockResolvedValue({
        accessToken: 'stored-token',
        expiresAt: Date.now() + 65000,
        refreshToken: '',
      })
      vi.spyOn(client, 'getGrantedScopes').mockResolvedValue(['profile'])

      const token = await client.getAuthToken()
      expect(token).toBe('stored-token')
    })

    it('should return stored token if requested scopes are already granted', async () => {
      vi.spyOn(client, 'getTokenFromStoreOrRefreshToken').mockResolvedValue({
        accessToken: 'stored-token',
        expiresAt: new Date().getTime() + 65000,
        refreshToken: '',
      })
      vi.spyOn(client, 'getGrantedScopes').mockResolvedValue([
        'profile',
        'email',
      ])

      const token = await client.getAuthToken(false, ['profile'])
      expect(token).toBe('stored-token')
    })

    it('should initiate auth flow if requested scopes are not granted', async () => {
      vi.spyOn(client, 'getTokenFromStoreOrRefreshToken').mockResolvedValue({
        accessToken: 'stored-token',
        expiresAt: Date.now() + 65000,
        refreshToken: '',
      })
      vi.spyOn(client, 'getGrantedScopes').mockResolvedValue(['profile'])
      vi.spyOn(client, 'createAuthUrl').mockResolvedValue(
        new URL('http://mock')
      )

      const mockTokens: OAuth2Token = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: Date.now() + 3600000,
      }

      vi.spyOn(client, 'validate').mockResolvedValue(mockTokens)
      vi.mocked(handler.open).mockResolvedValue(
        new URL('http://callback?code=123&state=abc')
      )

      const token = await client.getAuthToken(true, ['tasks'])
      expect(client.createAuthUrl).toHaveBeenCalledWith(['tasks'], undefined)
      expect(token).toBe('new-access-token')
    })

    it('should return undefined if no token and not interactive', async () => {
      vi.spyOn(client, 'getTokenFromStoreOrRefreshToken').mockResolvedValue(
        undefined
      )

      const token = await client.getAuthToken(false)
      expect(token).toBeUndefined()
    })

    it('should call handler and validate when interactive', async () => {
      vi.spyOn(client, 'getTokenFromStoreOrRefreshToken').mockResolvedValue(
        undefined
      )

      const mockTokens: OAuth2Token = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: Date.now() + 3600000,
      }

      vi.spyOn(client, 'validate').mockResolvedValue(mockTokens)

      const mockUrl = new URL(
        'http://localhost:3000/callback?code=mockcode&state=mockstate'
      )
      vi.mocked(handler.open).mockResolvedValue(mockUrl)

      const token = await client.getAuthToken(true)

      expect(handler.open).toHaveBeenCalled()
      expect(client.validate).toHaveBeenCalledWith('mockcode', 'mockstate')
      expect(token).toBe('new-access-token')
    })
  })

  describe('createAuthUrl and state handling', () => {
    it('should store state and verifier when creating auth URL', async () => {
      const authUrl = await client.createAuthUrl()

      expect(authUrl).toBeDefined()

      if (authUrl) {
        expect(authUrl.search).toEqual(expect.stringContaining('state='))
        expect(authUrl.origin).toEqual(
          expect.stringContaining('https://accounts.google.com')
        )
      }

      expect(storage.set).toHaveBeenCalledWith(
        client.authStateKey,
        expect.objectContaining({
          state: expect.any(String),
          codeVerifier: expect.any(String),
        })
      )
    })

    it('should throw error in validate if state does not match', async () => {
      vi.mocked(storage.get).mockResolvedValueOnce({
        state: 'saved-state',
        codeVerifier: 'saved-verifier',
      })

      await expect(client.validate('code', 'mismatched-state')).rejects.toThrow(
        'Code or state mismatch'
      )
    })

    it('should throw error in validate if no state stored', async () => {
      vi.mocked(storage.get).mockResolvedValueOnce(null)
      await expect(client.validate('code', 'state')).rejects.toThrow(
        'Code or state mismatch'
      )
    })

    it('should throw error if redirectUrl is missing when creating auth URL', async () => {
      const clientWithoutRedirect = new AuthClient('google', config, {
        storage,
      })
      await expect(clientWithoutRedirect.createAuthUrl()).rejects.toThrow(
        'Redirect URL is required to create auth URL'
      )
    })
  })

  describe('GoogleAuthClient', () => {
    it('should instantiate with Google defaults and support options', async () => {
      const google = new GoogleAuthClient(
        { clientId: 'test-google-id' },
        { storage, redirectUrl: 'http://localhost/callback' }
      )

      expect(google.name).toBe('google')
      expect(google.config.clientId).toBe('test-google-id')
      expect(google.config.authorizationEndpoint).toBe(
        'https://accounts.google.com/o/oauth2/v2/auth'
      )
      expect(google.config.tokenEndpoint).toBe(
        'https://oauth2.googleapis.com/token'
      )
      expect(google.extraParams).toEqual(
        expect.objectContaining({
          access_type: 'offline',
          prompt: 'consent',
        })
      )
    })
  })
})
