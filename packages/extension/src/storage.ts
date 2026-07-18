import * as browser from 'webextension-polyfill'
import {
  BaseStorage,
  CacheItem,
  isCacheItem,
  isExpired,
} from '@melledijkstra/storage'

export class ExtensionStorage extends BaseStorage {
  storageArea: browser.Storage.StorageArea

  constructor(storageType = browser.storage.local) {
    super()
    this.storageArea = storageType
  }

  async get<T>(key: string): Promise<T | undefined> {
    const result = await this.storageArea.get(key)
    const raw = result[key]
    if (!raw) return undefined

    try {
      const item = raw as CacheItem<T>

      // Basic validation of the cache item structure
      if (!isCacheItem(item)) {
        return undefined
      }

      if (isExpired(item)) {
        await this.delete(key)
        return undefined
      }

      return item.data
    } catch {
      return undefined
    }
  }

  set<T>(key: string, value: T, ttl = Infinity): Promise<void> {
    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    }
    return this.storageArea.set({ [key]: item })
  }

  delete(key: string): Promise<void> {
    return this.storageArea.remove(key)
  }

  clear(): Promise<void> {
    return this.storageArea.clear()
  }

  async keys(): Promise<string[]> {
    const allItems = await this.storageArea.get(null)
    const activeKeys: string[] = []

    for (const [key, raw] of Object.entries(allItems)) {
      if (raw === undefined || raw === null) continue

      try {
        if (isCacheItem(raw) && isExpired(raw)) {
          await this.delete(key)
          continue
        }
        activeKeys.push(key)
      } catch {
        // If parsing fails, consider it an active key (not a cache item)
        activeKeys.push(key)
      }
    }

    return activeKeys
  }
}
