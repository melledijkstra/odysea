import { Logger } from '@melledijkstra/toolbox'
import { IStorage } from './storage.interface'

const logger = new Logger('cache')

type CacheItem<T> = {
  data: T
  timestamp: number
  ttl: number
}

const cache: Record<string, CacheItem<unknown> | undefined> = {}

// Default TTL Times (Time To Live)
export const SEC_30 = 30 * 1000
export const MIN_1 = 1 * 60 * 1000
export const MIN_3 = 3 * 60 * 1000
export const MIN_5 = 5 * 60 * 1000
export const MIN_10 = 10 * 60 * 1000
export const MIN_15 = 15 * 60 * 1000

export function get(key: string) {
  const cachedItem = cache[key]
  if (cachedItem) {
    if (Date.now() - cachedItem.timestamp > cachedItem.ttl) {
      delete cache[key]
    }
    else {
      logger.log('Cache hit:', key)
      return cachedItem.data
    }
  }
}

export function set(key: string, value: unknown, ttl = Infinity): void {
  cache[key] = {
    data: value,
    timestamp: Date.now(),
    ttl: ttl ?? MIN_5,
  }
}

type CacheOptions = {
  key?: string
  ttl?: number
}

/**
 * Curried `withCache`: first call it with your options,
 * then call the returned function with your async function.
 */
export function withCache<T, A extends unknown[]>(
  originalFunc: (...args: A) => Promise<T>,
  options: CacheOptions = {},
): (...args: A) => Promise<T> {
  const defaultTTL = 5 * 60 * 1000 // 5 minutes

  // Return a new function that expects the actual async function
  const cachedFunction = async <T>(...args: A): Promise<T> => {
    const cacheKey = options?.key ?? originalFunc.name
    const cacheTTL = options?.ttl ?? defaultTTL

    // Attempt to get from cache
    const cachedData = get(cacheKey)
    if (cachedData !== undefined) {
      return cachedData as T
    }

    // Otherwise, call the original function, then store and return its result
    const result = (await originalFunc(...args)) as T
    set(cacheKey, result, cacheTTL)
    return result
  }

  return cachedFunction
}

export class MemoryCache implements IStorage {
  logger = new Logger('MemoryCache')
  private _cache: Record<string, CacheItem<unknown> | undefined> = {}

  async get<T>(key: string): Promise<T | undefined> {
    const cachedItem = this._cache[key]
    if (!cachedItem) {
      return
    }

    if (Date.now() - cachedItem.timestamp > cachedItem.ttl) {
      delete this._cache[key]
    }
    else {
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

  isExpired(key: string): boolean {
    const cachedItem = this._cache[key]
    if (!cachedItem) {
      return true // No item means it's "expired" or never existed
    }

    if (Date.now() - cachedItem.timestamp > cachedItem.ttl) {
      delete this._cache[key]
      return true
    }

    return false
  }

  async has(key: string): Promise<boolean> {
    const cachedItem = this._cache[key]

    if (!cachedItem) {
      return false
    }

    if (this.isExpired(key)) {
      return false
    }

    if (Date.now() - cachedItem.timestamp > cachedItem.ttl) {
      delete this._cache[key]
      return false
    }

    return true
  }

  async keys(): Promise<string[]> {
    return Object.keys(this._cache)
  }

  async size(): Promise<number> {
    return Object.keys(this._cache).length
  }
}
