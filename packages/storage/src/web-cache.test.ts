import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { trimWebCache } from './web-cache'

interface MockCacheEntry {
  request: Request
  response: Response
}

function createMockCaches(initialEntries: MockCacheEntry[] = []) {
  const entries = new Map<Request, Response>(
    initialEntries.map(({ request, response }) => [request, response])
  )

  const mockCache = {
    keys: vi.fn(async () => Array.from(entries.keys())),
    match: vi.fn(async (req: Request) => entries.get(req)),
    delete: vi.fn(async (req: Request) => entries.delete(req)),
  }

  const mockCaches = {
    open: vi.fn(async () => mockCache),
  }

  return { mockCaches, mockCache, entries }
}

function makeEntry(url: string, dateHeader?: string): MockCacheEntry {
  const headers = new Headers()
  if (dateHeader !== undefined) {
    headers.set('Date', dateHeader)
  }
  return {
    request: new Request(url),
    response: new Response('ok', { headers }),
  }
}

describe('trimWebCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('should return gracefully when Cache API is unavailable', async () => {
    vi.stubGlobal('caches', undefined)
    await expect(
      trimWebCache('test-cache', { maxEntries: 5, maxAgeSeconds: 60 })
    ).resolves.toBeUndefined()
  })

  it('should delete entries older than maxAgeSeconds based on Date header', async () => {
    const oldEntry = makeEntry(
      'https://example.com/old.jpg',
      '2026-01-01T12:00:00.000Z'
    )
    const freshEntry = makeEntry(
      'https://example.com/fresh.jpg',
      '2026-01-10T11:30:00.000Z'
    )
    const noDateEntry = makeEntry('https://example.com/nodate.jpg')

    const { mockCaches, entries } = createMockCaches([
      oldEntry,
      freshEntry,
      noDateEntry,
    ])
    vi.stubGlobal('caches', mockCaches)

    await trimWebCache('images', { maxAgeSeconds: 3600 })

    expect(mockCaches.open).toHaveBeenCalledWith('images')
    expect(Array.from(entries.keys()).map((r) => r.url)).toEqual([
      'https://example.com/fresh.jpg',
      'https://example.com/nodate.jpg',
    ])
  })

  it('should evict oldest entries first when exceeding maxEntries', async () => {
    const e1 = makeEntry('https://example.com/1.jpg')
    const e2 = makeEntry('https://example.com/2.jpg')
    const e3 = makeEntry('https://example.com/3.jpg')
    const e4 = makeEntry('https://example.com/4.jpg')

    const { mockCaches, entries } = createMockCaches([e1, e2, e3, e4])
    vi.stubGlobal('caches', mockCaches)

    await trimWebCache('images', { maxEntries: 2 })

    expect(Array.from(entries.keys()).map((r) => r.url)).toEqual([
      'https://example.com/3.jpg',
      'https://example.com/4.jpg',
    ])
  })

  it('should apply maxAgeSeconds first and then enforce maxEntries', async () => {
    const expired = makeEntry(
      'https://example.com/expired.jpg',
      '2026-01-01T00:00:00.000Z'
    )
    const fresh1 = makeEntry(
      'https://example.com/fresh1.jpg',
      '2026-01-10T11:50:00.000Z'
    )
    const fresh2 = makeEntry(
      'https://example.com/fresh2.jpg',
      '2026-01-10T11:55:00.000Z'
    )
    const fresh3 = makeEntry(
      'https://example.com/fresh3.jpg',
      '2026-01-10T11:59:00.000Z'
    )

    const { mockCaches, entries } = createMockCaches([
      expired,
      fresh1,
      fresh2,
      fresh3,
    ])
    vi.stubGlobal('caches', mockCaches)

    await trimWebCache('images', { maxAgeSeconds: 3600, maxEntries: 2 })

    expect(Array.from(entries.keys()).map((r) => r.url)).toEqual([
      'https://example.com/fresh2.jpg',
      'https://example.com/fresh3.jpg',
    ])
  })

  it('should ignore invalid Date headers without deleting the entry', async () => {
    const invalidDateEntry = makeEntry(
      'https://example.com/bad-date.jpg',
      'not-a-valid-date'
    )

    const { mockCaches, entries } = createMockCaches([invalidDateEntry])
    vi.stubGlobal('caches', mockCaches)

    await trimWebCache('images', { maxAgeSeconds: 60 })

    expect(Array.from(entries.keys()).map((r) => r.url)).toEqual([
      'https://example.com/bad-date.jpg',
    ])
  })
})
