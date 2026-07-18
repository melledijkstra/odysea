import { BaseStorage } from './base'
import type { CacheItem } from './types'
import { Logger } from '@melledijkstra/toolbox'
import { isCacheItem, isExpired } from './utils'

const logger = new Logger('WebLocalStorage')

export class WebLocalStorage extends BaseStorage {
  private isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    )
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (!this.isAvailable()) return undefined

    const raw = localStorage.getItem(key)
    if (!raw) return undefined

    try {
      const item = JSON.parse(raw)

      // Basic validation of the cache item structure
      if (!isCacheItem(item)) {
        return undefined
      }

      if (isExpired(item)) {
        await this.delete(key)
        return undefined
      }

      return item.data as T
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

  async keys(): Promise<string[]> {
    if (!this.isAvailable()) return []
    const activeKeys: string[] = []

    const allKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        allKeys.push(key)
      }
    }

    for (const key of allKeys) {
      const val = await this.get(key)
      if (val !== undefined) {
        activeKeys.push(key)
      }
    }
    return activeKeys
  }
}
