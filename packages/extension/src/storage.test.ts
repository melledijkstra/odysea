import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ExtensionStorage } from './storage'

const mockStorageLocal = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn()
}))

vi.mock('webextension-polyfill', () => ({
  storage: {
    local: mockStorageLocal
  }
}))

describe('ExtensionStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call browser.storage.local.set and get with TTL wrapper', async () => {
    const storage = new ExtensionStorage()
    
    // Simulate what get would return
    mockStorageLocal.get.mockResolvedValue({
      foo: {
        data: 'bar',
        timestamp: Date.now(),
        ttl: Infinity
      }
    })

    const val = await storage.get('foo')
    expect(val).toBe('bar')
    expect(mockStorageLocal.get).toHaveBeenCalledWith('foo')

    await storage.set('foo', 'bar')
    
    // Check that we're calling set with an object that contains the CacheItem structure
    expect(mockStorageLocal.set).toHaveBeenCalled()
    const setArgs = mockStorageLocal.set.mock.calls[0][0]
    expect(setArgs).toHaveProperty('foo')
    expect(setArgs.foo).toHaveProperty('data', 'bar')
    expect(setArgs.foo).toHaveProperty('timestamp')
    expect(setArgs.foo).toHaveProperty('ttl', Infinity)
  })

  it('should return undefined and delete key if expired', async () => {
    vi.useFakeTimers()
    const storage = new ExtensionStorage()
    
    // Mock remove function if it doesn't exist on mock
    if (!mockStorageLocal.remove) {
      mockStorageLocal.remove = vi.fn(() => Promise.resolve())
    }

    mockStorageLocal.get.mockResolvedValue({
      foo: {
        data: 'bar',
        timestamp: Date.now(),
        ttl: 1000 // 1 second
      }
    })

    vi.advanceTimersByTime(2000)

    const val = await storage.get('foo')
    expect(val).toBeUndefined()
    expect(mockStorageLocal.remove).toHaveBeenCalledWith('foo')

    vi.useRealTimers()
  })

  it('should call browser.storage.local.remove on delete', async () => {
    const storage = new ExtensionStorage()
    // Mock remove function on local storage mock if it doesn't exist
    if (!mockStorageLocal.remove) {
      mockStorageLocal.remove = vi.fn(() => Promise.resolve())
    }
    await storage.delete('foo')
    expect(mockStorageLocal.remove).toHaveBeenCalledWith('foo')
  })
  
  it('should clear all items', async () => {
    const storage = new ExtensionStorage()
    if (!mockStorageLocal.clear) {
      mockStorageLocal.clear = vi.fn(() => Promise.resolve())
    }
    await storage.clear()
    expect(mockStorageLocal.clear).toHaveBeenCalled()
  })
})
