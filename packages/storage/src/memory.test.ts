import { MemoryCache } from './memory'
import { minutes } from '@melledijkstra/toolbox'

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

  it('should filter out and clean up expired keys in keys()', async () => {
    const cache = new MemoryCache()

    await cache.set('persistent', 'a')
    await cache.set('short-lived', 'b', minutes(1))
    await cache.set('longer-lived', 'c', minutes(10))

    expect(await cache.keys()).toEqual([
      'persistent',
      'short-lived',
      'longer-lived',
    ])

    vi.advanceTimersByTime(minutes(2))

    expect(await cache.keys()).toEqual(['persistent', 'longer-lived'])
    expect(await cache.size()).toBe(2)
    expect(await cache.has('short-lived')).toBe(false)
  })
})
