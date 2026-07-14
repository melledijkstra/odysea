import { describe, expect, it, vi } from 'vitest'
import { ExtensionStorageAdapter } from './browser-extension'

import browser from 'webextension-polyfill'

// Setup mocks for webextension-polyfill
const mockStorageLocal = vi.mocked(browser.storage.local)

describe('ExtensionStorageAdapter', () => {
  it('should call browser.storage.local.set and get', async () => {
    const adapter = new ExtensionStorageAdapter()
    mockStorageLocal.get.mockResolvedValue({ foo: 'bar' })

    const val = await adapter.get('foo')
    expect(val).toBe('bar')
    expect(mockStorageLocal.get).toHaveBeenCalledWith('foo')

    await adapter.set('foo', 'bar')
    expect(mockStorageLocal.set).toHaveBeenCalledWith({ foo: 'bar' })
  })

  it('should call browser.storage.local.remove on delete', async () => {
    const adapter = new ExtensionStorageAdapter()
    // Mock remove function on local storage mock if it doesn't exist
    if (!mockStorageLocal.remove) {
      mockStorageLocal.remove = vi.fn(() => Promise.resolve())
    }
    await adapter.delete('foo')
    expect(mockStorageLocal.remove).toHaveBeenCalledWith('foo')
  })
})
