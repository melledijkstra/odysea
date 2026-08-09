import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthClient, AuthFlowHandler } from './auth-client'
import { GoogleAuthConfig } from './providers'
import { MemoryCache } from '@melledijkstra/storage'
import {
  OAuth2Tokens,
  OAuth2RequestError,
  UnexpectedErrorResponseBodyError,
  Google,
} from 'arctic'

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

vi.mock('arctic', async (importOriginal) => {
  const actual = await importOriginal<typeof import('arctic')>()
  return {
    ...actual,
    Google: class extends actual.Google {
      async refreshAccessToken(refreshToken: string): Promise<OAuth2Tokens> {
        return super.refreshAccessToken(refreshToken)
      }
    },
  }
})

describe('AuthClient', () => {
  let storage: MemoryCache
  let handler: AuthFlowHandler
  let client: AuthClient
  let googleAuth: GoogleAuthConfig

  beforeEach(() => {
    vi.clearAllMocks()
    storage = new MemoryCache()
    handler = {
      open: vi.fn(),
    }
    googleAuth = new GoogleAuthConfig()
    client = new AuthClient(googleAuth, 'http://localhost:3000/callback', {
      storage,
      handler,
    })
  })

  describe('token management', () => {
    it('should correctly report isAuthenticated based on getAuthToken', async () => {
      vi.spyOn(client, 'getAuthToken').mockResolvedValueOnce('token')
      expect(await client.isAuthenticated()).toBe(true)

      vi.spyOn(client, 'getAuthToken').mockResolvedValueOnce(undefined)
      expect(await client.isAuthenticated()).toBe(false)
    })

    it('should deauthenticate correctly', async () => {
      vi.spyOn(client, 'getAuthTokenFromStorage').mockResolvedValueOnce({
        access_token: 'old-token',
        expires_at: Date.now() + 10000,
        refresh_token: 'old-refresh',
      })
      vi.spyOn(client, 'revokeAuthToken').mockResolvedValueOnce(undefined)
      vi.spyOn(client, 'removeAuthTokenFromStorage').mockResolvedValueOnce(
        undefined
      )

      const result = await client.deauthenticate()

      expect(result).toBe(true)
      expect(client.revokeAuthToken).toHaveBeenCalledWith('old-token')
      expect(client.removeAuthTokenFromStorage).toHaveBeenCalled()
    })

    it('getTokenFromStoreOrRefreshToken should refresh if token is expired', async () => {
      const mockStore = {
        access_token: 'expired-token',
        expires_at: Date.now() - 10000,
        refresh_token: 'refresh-token',
      }
      vi.spyOn(client, 'getAuthTokenFromStorage').mockResolvedValueOnce(
        mockStore
      )

      const mockTokens = {
        accessToken: () => 'new-access-token',
        hasRefreshToken: () => true,
        refreshToken: () => 'new-refresh-token',
        accessTokenExpiresInSeconds: () => 3600,
        hasScopes: () => true,
        scopes: () => ['profile', 'email']
      } as unknown as OAuth2Tokens

      vi.spyOn(client, 'refreshAccessToken').mockResolvedValueOnce(mockTokens)
      vi.spyOn(client, 'cacheAuthToken').mockResolvedValueOnce(undefined)

      const token = await client.getTokenFromStoreOrRefreshToken()

      expect(client.refreshAccessToken).toHaveBeenCalledWith('refresh-token')
      expect(client.cacheAuthToken).toHaveBeenCalledWith(
        'new-access-token',
        'new-refresh-token',
        3600,
        ['profile', 'email']
      )
      expect(token).toBe('new-access-token')
    })

    it('getTokenFromStoreOrRefreshToken should reuse old refresh token when provider omits one from response', async () => {
      const mockStore = {
        access_token: 'expired-token',
        expires_at: Date.now() - 10000,
        refresh_token: 'old-refresh-token',
        scopes: ['profile', 'email']
      }
      vi.spyOn(client, 'getAuthTokenFromStorage').mockResolvedValue(
        mockStore
      )

      // Simulate a provider that returns no refresh_token and no scopes in the response
      const mockTokens = {
        accessToken: () => 'new-access-token',
        hasRefreshToken: () => false,
        accessTokenExpiresInSeconds: () => 3600,
        hasScopes: () => false
      } as unknown as OAuth2Tokens

      vi.spyOn(client, 'refreshAccessToken').mockResolvedValueOnce(mockTokens)
      vi.spyOn(client, 'cacheAuthToken').mockResolvedValueOnce(undefined)

      const token = await client.getTokenFromStoreOrRefreshToken()

      // Should reuse the old refresh token and old scopes instead of throwing
      expect(client.cacheAuthToken).toHaveBeenCalledWith(
        'new-access-token',
        'old-refresh-token',
        3600,
        ['profile', 'email']
      )
      expect(token).toBe('new-access-token')
    })

    it('getTokenFromStoreOrRefreshToken should delete token on invalid refresh token error', async () => {
      const mockStore = {
        access_token: 'expired-token',
        expires_at: Date.now() - 10000,
        refresh_token: 'refresh-token',
      }
      vi.spyOn(client, 'getAuthTokenFromStorage').mockResolvedValueOnce(
        mockStore
      )

      // To throw the internal AuthError, we need to make the internal _authclient throw OAuth2RequestError
      const reqError = new OAuth2RequestError(
        'invalid_grant',
        'Refresh token invalid: mock-reason',
        'https://mock-endpoint.com',
        'mock-state'
      )

      vi.spyOn(Google.prototype, 'refreshAccessToken').mockRejectedValueOnce(
        reqError
      )

      const token = await client.getTokenFromStoreOrRefreshToken()

      expect(storage.delete).toHaveBeenCalledWith(client.storageKey)
      expect(token).toBeUndefined()
    })

    it('should delete token when refresh token is invalid', async () => {
      const mockStore = {
        access_token: 'expired-token',
        expires_at: Date.now() - 10000,
        refresh_token: 'refresh-token',
      }
      vi.spyOn(client, 'getAuthTokenFromStorage').mockResolvedValueOnce(
        mockStore
      )

      const reqError = new UnexpectedErrorResponseBodyError(400, {
        errorType: 'invalid_grant',
        message: 'Refresh token invalid: mock-reason',
        errors: [
          {
            errorType: 'invalid_grant',
            message: 'Refresh token invalid: mock-reason',
          },
        ],
      })

      vi.spyOn(Google.prototype, 'refreshAccessToken').mockRejectedValueOnce(
        reqError
      )

      const token = await client.getTokenFromStoreOrRefreshToken()

      expect(storage.delete).toHaveBeenCalledWith(client.storageKey)
      expect(token).toBeUndefined()
    })

    it('should deduplicate concurrent refresh calls', async () => {
      const mockStore = {
        access_token: 'expired-token',
        expires_at: Date.now() - 10000,
        refresh_token: 'refresh-token',
      }
      vi.spyOn(client, 'getAuthTokenFromStorage').mockResolvedValue(mockStore)

      const mockTokens = {
        accessToken: () => 'new-access-token',
        hasRefreshToken: () => true,
        refreshToken: () => 'new-refresh-token',
        accessTokenExpiresInSeconds: () => 3600,
        hasScopes: () => false,
      } as unknown as OAuth2Tokens

      const refreshSpy = vi
        .spyOn(client, 'refreshAccessToken')
        .mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 50))
          return mockTokens
        })
      vi.spyOn(client, 'cacheAuthToken').mockResolvedValue(undefined)

      const [token1, token2, token3] = await Promise.all([
        client.getTokenFromStoreOrRefreshToken(),
        client.getTokenFromStoreOrRefreshToken(),
        client.getTokenFromStoreOrRefreshToken(),
      ])

      expect(refreshSpy).toHaveBeenCalledTimes(1)
      expect(token1).toBe('new-access-token')
      expect(token2).toBe('new-access-token')
      expect(token3).toBe('new-access-token')
    })
  })

  describe('authentication flows (getAuthToken)', () => {
    it('should return stored token if available', async () => {
      vi.spyOn(client, 'getTokenFromStoreOrRefreshToken').mockResolvedValue(
        'stored-token'
      )
      vi.spyOn(client, 'getGrantedScopes').mockResolvedValue(['profile'])

      const token = await client.getAuthToken()
      expect(token).toBe('stored-token')
    })

    it('should return stored token if requested scopes are already granted', async () => {
      vi.spyOn(client, 'getTokenFromStoreOrRefreshToken').mockResolvedValue(
        'stored-token'
      )
      vi.spyOn(client, 'getGrantedScopes').mockResolvedValue(['profile', 'email'])

      const token = await client.getAuthToken(false, ['profile'])
      expect(token).toBe('stored-token')
    })

    it('should initiate auth flow if requested scopes are not granted', async () => {
      vi.spyOn(client, 'getTokenFromStoreOrRefreshToken').mockResolvedValue(
        'stored-token'
      )
      vi.spyOn(client, 'getGrantedScopes').mockResolvedValue(['profile'])
      vi.spyOn(client, 'createAuthUrl').mockResolvedValue(new URL('http://mock'))
      
      const mockTokens = {
        accessToken: () => 'new-access-token',
        hasRefreshToken: () => true,
        refreshToken: () => 'new-refresh-token',
        accessTokenExpiresInSeconds: () => 3600,
        hasScopes: () => true,
        scopes: () => ['profile', 'tasks']
      } as unknown as OAuth2Tokens

      vi.spyOn(client, 'validate').mockResolvedValue(mockTokens)
      vi.mocked(handler.open).mockResolvedValue(new URL('http://callback?code=123&state=abc'))

      const token = await client.getAuthToken(true, ['tasks'])
      expect(client.createAuthUrl).toHaveBeenCalledWith(['tasks'])
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

      const mockTokens = {
        accessToken: () => 'new-access-token',
        hasRefreshToken: () => true,
        refreshToken: () => 'new-refresh-token',
        accessTokenExpiresInSeconds: () => 3600,
        hasScopes: () => false,
      } as unknown as OAuth2Tokens

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

    it('should accept when provider does not return a refresh token during initial auth flow', async () => {
      vi.spyOn(client, 'getTokenFromStoreOrRefreshToken').mockResolvedValue(
        undefined
      )

      // Provider returns no refresh_token (e.g. missing access_type=offline)
      const mockTokens = new OAuth2Tokens({
        access_token: 'new-access-token',
        expires_in: 3600,
        // no refresh_token field
      })

      vi.spyOn(client, 'validate').mockResolvedValue(mockTokens)

      const mockUrl = new URL(
        'http://localhost:3000/callback?code=mockcode&state=mockstate'
      )
      vi.mocked(handler.open).mockResolvedValue(mockUrl)

      // The error is caught internally and logged; getAuthToken returns undefined
      const token = await client.getAuthToken(true)
      expect(token).toBe('new-access-token')
    })
  })

  it('should instantiate correctly', () => {
    expect(client).toBeDefined()
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

      const context = client.getContext()
      expect(context.state).toBeDefined()
      expect(context.codeVerifier).toBeDefined()

      expect(storage.set).toHaveBeenCalledWith(client.authStateKey, {
        state: context.state,
        codeVerifier: context.codeVerifier,
      })
    })

    it('should include previously granted scopes and newly requested scopes in auth url', async () => {
      vi.spyOn(client, 'getGrantedScopes').mockResolvedValue(['profile'])
      const authUrl = await client.createAuthUrl(['tasks', 'email'])
      
      expect(authUrl).toBeDefined()
      // Google provider passes space-separated scopes in the URL
      expect(authUrl?.searchParams.get('scope')).toContain('profile')
      expect(authUrl?.searchParams.get('scope')).toContain('tasks')
      expect(authUrl?.searchParams.get('scope')).toContain('email')
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
  })
})
