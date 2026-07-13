import { beforeEach, describe, expect, it, vi } from "vitest"
import { LocalStorageAdapter } from "./localstorage"

describe('LocalStorageAdapter', () => {
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
  }

  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', localStorageMock)
    vi.clearAllMocks()
  })

  it('should set and get parsed values', () => {
    const adapter = new LocalStorageAdapter()
    adapter.set('foo', { a: 1 })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('foo', JSON.stringify({ a: 1 }))
    expect(adapter.get('foo')).toEqual({ a: 1 })
    expect(localStorageMock.getItem).toHaveBeenCalledWith('foo')
  })

  it('should return null for non-existent key', () => {
    const adapter = new LocalStorageAdapter()
    expect(adapter.get('nonexistent')).toBeNull()
    expect(localStorageMock.getItem).toHaveBeenCalledWith('nonexistent')
  })

  it('should delete keys correctly', () => {
    const adapter = new LocalStorageAdapter()
    adapter.set('foo', 'bar')
    adapter.delete('foo')
    expect(adapter.get('foo')).toBeNull()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('foo')
  })

  it('should clear all keys', () => {
    const adapter = new LocalStorageAdapter()
    adapter.set('foo', 'bar')
    adapter.clear()
    expect(adapter.get('foo')).toBeNull()
    expect(localStorageMock.clear).toHaveBeenCalled()
  })
})
