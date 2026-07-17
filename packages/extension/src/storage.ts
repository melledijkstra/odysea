import * as browser from 'webextension-polyfill'
import { IStorage, CacheItem } from '@melledijkstra/storage'

export class ExtensionStorage implements IStorage {
  storageArea: browser.Storage.StorageArea

  private isExpired(item: CacheItem<unknown>): boolean {
    if (item.ttl === Infinity || item.ttl === null || item.ttl === undefined || String(item.ttl) === 'Infinity') return false
    return Date.now() - item.timestamp > item.ttl
  }

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
      if (!item || typeof item !== 'object' || !('data' in item) || !('timestamp' in item)) {
         return undefined
      }

      if (this.isExpired(item)) {
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
    
    for (const key of Object.keys(allItems)) {
      const val = await this.get(key)
      if (val !== undefined) {
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
