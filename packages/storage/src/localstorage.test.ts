import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WebLocalStorage } from './localstorage'

describe('WebLocalStorage', () => {
  let store: Record<string, string> = {}

  const localStorageMock = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() {
      return Object.keys(store).length
    },
  }

  beforeEach(() => {
    store = {}
    vi.stubGlobal('window', { localStorage: localStorageMock })
    vi.stubGlobal('localStorage', localStorageMock)
    vi.clearAllMocks()
  })

  it('should set and get values wrapped with TTL', async () => {
    const storage = new WebLocalStorage()
    await storage.set('foo', { a: 1 })

    // Check it's storing in localStorage as a stringified CacheItem
    const rawStored = JSON.parse(store['foo'])
    expect(rawStored).toHaveProperty('data', { a: 1 })
    expect(rawStored).toHaveProperty('timestamp')
    expect(rawStored).toHaveProperty('ttl', null)

    const result = await storage.get('foo')
    expect(result).toEqual({ a: 1 })
    expect(localStorageMock.getItem).toHaveBeenCalledWith('foo')
  })

  it('should return undefined for non-existent key', async () => {
    const storage = new WebLocalStorage()
    expect(await storage.get('nonexistent')).toBeUndefined()
    expect(localStorageMock.getItem).toHaveBeenCalledWith('nonexistent')
  })

  it('should return undefined and delete key if expired', async () => {
    vi.useFakeTimers()
    const storage = new WebLocalStorage()
    await storage.set('foo', 'bar', 1000) // TTL 1 second

    vi.advanceTimersByTime(2000)

    expect(await storage.get('foo')).toBeUndefined()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('foo')

    vi.useRealTimers()
  })

  it('should delete keys correctly', async () => {
    const storage = new WebLocalStorage()
    await storage.set('foo', 'bar')
    await storage.delete('foo')
    expect(await storage.get('foo')).toBeUndefined()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('foo')
  })

  it('should clear all keys', async () => {
    const storage = new WebLocalStorage()
    await storage.set('foo', 'bar')
    await storage.clear()
    expect(await storage.get('foo')).toBeUndefined()
    expect(localStorageMock.clear).toHaveBeenCalled()
  })

  it('should report keys and size correctly', async () => {
    const storage = new WebLocalStorage()
    await storage.set('a', 1)
    await storage.set('b', 2)

    expect(await storage.has('a')).toBe(true)
    expect(await storage.keys()).toEqual(['a', 'b'])
    expect(await storage.size()).toBe(2)
  })
})
