import * as browser from 'webextension-polyfill'
import {
  IStorage,
  CacheItem,
  isCacheItem,
  isExpired,
} from '@melledijkstra/storage'

export class ExtensionStorage implements IStorage {
  storageArea: browser.Storage.StorageArea

  constructor(storageType = browser.storage.local) {
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

  async has(key: string): Promise<boolean> {
    const val = await this.get(key)
    return val !== undefined
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

  async size(): Promise<number> {
    const keys = await this.keys()
    return keys.length
  }
}
