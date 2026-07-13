import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { BaseClient } from './baseclient'

class TestClient extends BaseClient {
  constructor(baseUrl: string) {
    super(baseUrl)
  }
}

const createMockResponse = (overrides?: Partial<Response>): Response => ({
  ok: true,
  status: 200,
  headers: { get: () => 'application/json' },
  json: async () => ({ data: 'test' }),
  ...overrides,
} as unknown as Response)

describe('BaseClient', () => {
  let fetchSpy: MockInstance

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should instantiate with a base URL', () => {
    const client = new TestClient('https://api.example.com')
    expect(client.getBaseUrl()).toBe('https://api.example.com')
  })

  it('should throw if instantiated without a base URL', () => {
    expect(() => new TestClient('')).toThrow('BaseClient needs to be instantiated with a base URL')
  })

  describe('request', () => {
    it('should make a request to the correct URL', async () => {
      const client = new TestClient('https://api.example.com')
      fetchSpy.mockResolvedValue(createMockResponse())

      await client.request('/test')
      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/test', expect.objectContaining({
        headers: expect.objectContaining({
          accept: 'application/json',
        }),
      }))
    })

    it('should handle query parameters', async () => {
      const client = new TestClient('https://api.example.com')
      fetchSpy.mockResolvedValue(createMockResponse())

      const params = new URLSearchParams({ foo: 'bar' })
      await client.request('/test', undefined, params)
      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/test?foo=bar', expect.anything())
    })

    it('should return JSON data if response is ok and json', async () => {
      const client = new TestClient('https://api.example.com')
      const mockData = { data: 'test' }
      fetchSpy.mockResolvedValue(createMockResponse({ json: async () => mockData }))

      const result = await client.request('/test')
      expect(result).toEqual(mockData)
    })

    it('should return undefined if response is not ok', async () => {
      const client = new TestClient('https://api.example.com')
      fetchSpy.mockResolvedValue(createMockResponse({ ok: false, status: 404 }))

      const result = await client.request('/test')
      expect(result).toBeUndefined()
    })

    it('should return undefined if status is 204', async () => {
      const client = new TestClient('https://api.example.com')
      fetchSpy.mockResolvedValue(createMockResponse({ status: 204 }))

      const result = await client.request('/test')
      expect(result).toBeUndefined()
    })

    it('should return undefined if content type is not json', async () => {
      const client = new TestClient('https://api.example.com')
      fetchSpy.mockResolvedValue(createMockResponse({
        headers: { get: () => 'text/plain' } as unknown as Headers,
      }))

      const result = await client.request('/test')
      expect(result).toBeUndefined()
    })

    it('should merge custom headers', async () => {
      const client = new TestClient('https://api.example.com')
      fetchSpy.mockResolvedValue(createMockResponse())

      await client.request('/test', {
        headers: {
          Authorization: 'Bearer token',
        },
      })
      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/test', expect.objectContaining({
        headers: expect.objectContaining({
          accept: 'application/json',
          Authorization: 'Bearer token',
        }),
      }))
    })
  })
})
