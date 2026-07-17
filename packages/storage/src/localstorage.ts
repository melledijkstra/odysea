import { IStorage, CacheItem } from './storage.interface'
import { Logger } from '@melledijkstra/toolbox'

const logger = new Logger('WebLocalStorage')

export class WebLocalStorage implements IStorage {
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  }

  private isExpired(item: CacheItem<unknown>): boolean {
    if (item.ttl === Infinity || item.ttl === null || item.ttl === undefined || String(item.ttl) === 'Infinity') return false
    return Date.now() - item.timestamp > item.ttl
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (!this.isAvailable()) return undefined

    const raw = localStorage.getItem(key)
    if (!raw) return undefined

    try {
      const item = JSON.parse(raw) as CacheItem<T>
      
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
      // Failed to parse, probably corrupted or old format
      return undefined
    }
  }

  async set<T>(key: string, value: T, ttl = Infinity): Promise<void> {
    if (!this.isAvailable()) return

    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    }

    try {
      localStorage.setItem(key, JSON.stringify(item))
    } catch (e) {
      logger.error('Failed to set item in localStorage', e)
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isAvailable()) return
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    if (!this.isAvailable()) return
    localStorage.clear()
  }

  async has(key: string): Promise<boolean> {
    const val = await this.get(key)
    return val !== undefined
  }

  async keys(): Promise<string[]> {
    if (!this.isAvailable()) return []
    const activeKeys: string[] = []
    
    // We iterate over all keys, and only return those that are not expired and have our structure
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const val = await this.get(key)
        if (val !== undefined) {
           activeKeys.push(key)
        }
      }
    }
    return activeKeys
  }

  async size(): Promise<number> {
    const activeKeys = await this.keys()
    return activeKeys.length
  }
}
