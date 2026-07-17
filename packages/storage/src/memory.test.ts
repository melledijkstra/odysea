import { MemoryCache } from './memory'
import { minutes } from './utils'

describe('MemoryCache', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('should cache and retrieve values', async () => {
    const cache = new MemoryCache()

    await cache.set('foo', 'bar')
    expect(await cache.get('foo')).toBe('bar')
  })

  it('should remove expired values', async () => {
    const cache = new MemoryCache()

    await cache.set('foo', 'bar', minutes(5))

    vi.advanceTimersByTime(minutes(5) + 1000)

    expect(await cache.get('foo')).toBeUndefined()
  })

  it('should not remove non-expired values', async () => {
    const cache = new MemoryCache()

    await cache.set('foo', 'bar', minutes(5))

    vi.advanceTimersByTime(minutes(5) / 2)

    expect(await cache.get('foo')).toBe('bar')
  })
})
