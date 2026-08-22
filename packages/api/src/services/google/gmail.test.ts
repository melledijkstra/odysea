import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest'
import { GoogleGmailApiClient } from './gmail'
import type { AuthClient } from '@melledijkstra/auth'
import type { GmailLabel } from '../../definitions/google'

const createMockResponse = (overrides?: Partial<Response>): Response =>
  ({
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => ({}),
    ...overrides,
  }) as unknown as Response

describe('GoogleGmailApiClient', () => {
  let fetchSpy: MockInstance
  let mockAuthClient: AuthClient
  let client: GoogleGmailApiClient

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch')
    mockAuthClient = {
      getAuthToken: vi.fn().mockResolvedValue('mock-token'),
    } as unknown as AuthClient
    client = new GoogleGmailApiClient(mockAuthClient)

    // Silence logger during tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getLabel', () => {
    it('should return label details on success', async () => {
      const mockLabel: GmailLabel = {
        id: 'INBOX',
        name: 'INBOX',
        messagesTotal: 120,
        messagesUnread: 5,
        threadsTotal: 100,
        threadsUnread: 4,
      }
      fetchSpy.mockResolvedValue(
        createMockResponse({ json: async () => mockLabel })
      )

      const result = await client.getLabel('INBOX')
      expect(result).toEqual(mockLabel)
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://gmail.googleapis.com/gmail/v1/users/me/labels/INBOX',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      )
    })

    it('should return undefined if the API request fails', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'))

      const result = await client.getLabel('INBOX')
      expect(result).toBeUndefined()
    })
  })

  describe('getUnreadCount', () => {
    it('should return messagesUnread from label', async () => {
      const mockLabel: GmailLabel = {
        id: 'INBOX',
        name: 'INBOX',
        messagesUnread: 12,
      }
      fetchSpy.mockResolvedValue(
        createMockResponse({ json: async () => mockLabel })
      )

      const unread = await client.getUnreadCount('INBOX')
      expect(unread).toBe(12)
    })

    it('should return undefined if label cannot be fetched', async () => {
      fetchSpy.mockRejectedValue(new Error('API error'))

      const unread = await client.getUnreadCount('INBOX')
      expect(unread).toBeUndefined()
    })
  })
})
