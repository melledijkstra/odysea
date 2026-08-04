import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest'
import { GoogleHealthApiClient } from './health'
import type { AuthClient } from '@melledijkstra/auth'
import type { ReconcileDataPointsResponse } from '../../definitions/google'

const createMockResponse = (overrides?: Partial<Response>): Response =>
  ({
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => ({}),
    ...overrides,
  }) as unknown as Response

describe('GoogleHealthApiClient', () => {
  let fetchSpy: MockInstance
  let mockAuthClient: AuthClient
  let client: GoogleHealthApiClient

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch')
    mockAuthClient = {
      getAuthToken: vi.fn().mockResolvedValue('mock-token'),
    } as unknown as AuthClient
    client = new GoogleHealthApiClient(mockAuthClient)

    // Silence logger during tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getSleep', () => {
    it('should return undefined if the API returns no data points', async () => {
      const mockData: ReconcileDataPointsResponse = { dataPoints: [] }
      fetchSpy.mockResolvedValue(
        createMockResponse({ json: async () => mockData })
      )

      const result = await client.getSleep()
      expect(result).toBeUndefined()
    })

    it('should return undefined if the API request fails', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'))

      const result = await client.getSleep()
      expect(result).toBeUndefined()
    })

    it('should calculate the maximum sleep duration from valid data points', async () => {
      const mockData: ReconcileDataPointsResponse = {
        dataPoints: [
          { sleep: { summary: { minutesAsleep: '420' } } }, // 7 hours
          { sleep: { summary: { minutesAsleep: '480' } } }, // 8 hours
          { sleep: { summary: { minutesAsleep: '300' } } }, // 5 hours
        ],
      }
      fetchSpy.mockResolvedValue(
        createMockResponse({ json: async () => mockData })
      )

      const result = await client.getSleep()
      expect(result).toBe(480) // Should pick the max value
    })

    it('should ignore invalid or missing sleep duration values', async () => {
      const mockData: ReconcileDataPointsResponse = {
        dataPoints: [
          { sleep: undefined },
          { sleep: { summary: { minutesAsleep: 'invalid' } } },
          { sleep: { summary: { minutesAsleep: '350' } } },
        ],
      }
      fetchSpy.mockResolvedValue(
        createMockResponse({ json: async () => mockData })
      )

      const result = await client.getSleep()
      expect(result).toBe(350)
    })

    it('should make a GET request to the reconcile endpoint with the correct filter parameter', async () => {
      fetchSpy.mockResolvedValue(
        createMockResponse({ json: async () => ({ dataPoints: [] }) })
      )

      await client.getSleep()

      // Should have been called with GET and a filter query parameter
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /users\/me\/dataTypes\/sleep\/dataPoints:reconcile\?filter=/
        ),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })
})
