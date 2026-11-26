import { Logger } from '@melledijkstra/toolbox'
import { BaseStorage } from './base'
import type { CacheItem } from './types'
import { isExpired } from './utils'

export async function get<T>(key: string): Promise<T | undefined> {
  return globalMemoryCache.get<T>(key)
}

export async function set(
  key: string,
  value: unknown,
  ttl = Infinity
): Promise<void> {
  await globalMemoryCache.set(key, value, ttl)
}

type CacheOptions = {
  key?: string
  ttl?: number
}

/**
 * Wraps an async function with an in-memory TTL cache.
 * Caches the resolved value under `options.key` (or `originalFunc.name`)
 * for `options.ttl` milliseconds (default: 5 minutes).
 */
export function withCache<T, A extends unknown[]>(
  originalFunc: (...args: A) => Promise<T>,
  options: CacheOptions = {}
): (...args: A) => Promise<T> {
  const defaultTTL = 5 * 60 * 1000 // 5 minutes

  // Return a new function that expects the actual async function
  const cachedFunction = async (...args: A): Promise<T> => {
    const cacheKey = options?.key ?? originalFunc.name
    const cacheTTL = options?.ttl ?? defaultTTL

    // Attempt to get from cache
    const cachedData = await get<T>(cacheKey)
    if (cachedData !== undefined) {
      globalMemoryCache.logger.debug(`cache hit for: ${cacheKey}`)
      return cachedData
    }

    // Otherwise, call the original function, then store and return its result
    const result = await originalFunc(...args)
    await set(cacheKey, result, cacheTTL)
    return result
  }

  return cachedFunction
}

export class MemoryCache extends BaseStorage {
  logger = new Logger('MemoryCache')
  private _cache: Record<string, CacheItem<unknown> | undefined> = {}

  async get<T>(key: string): Promise<T | undefined> {
    const cachedItem = this._cache[key]
    if (!cachedItem) {
      return
    }

    if (isExpired(cachedItem)) {
      delete this._cache[key]
    } else {
      return cachedItem.data as T
    }
  }

  async set(key: string, value: unknown, ttl = Infinity) {
    this._cache[key] = {
      data: value,
      timestamp: Date.now(), // store insertion time
      ttl: ttl,
    }
  }

  async delete(key: string): Promise<void> {
    delete this._cache[key]
  }

  async clear(): Promise<void> {
    this._cache = {}
  }

  async keys(): Promise<string[]> {
    const activeKeys: string[] = []
    for (const key of Object.keys(this._cache)) {
      const item = this._cache[key]
      if (!item || isExpired(item)) {
        delete this._cache[key]
      } else {
        activeKeys.push(key)
      }
    }
    return activeKeys
  }
}

export const globalMemoryCache = new MemoryCache()
