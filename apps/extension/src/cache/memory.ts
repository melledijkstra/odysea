import { Logger } from '@/logger'
import type { ILogger } from '@/interfaces/logger.interface'
import { CacheService, type ICacheAdapter } from './cache-service'

// Default TTL Times (Time To Live)
export const SEC_30 = 30 * 1000
export const MIN_1 = 1 * 60 * 1000
export const MIN_3 = 3 * 60 * 1000
export const MIN_5 = 5 * 60 * 1000
export const MIN_10 = 10 * 60 * 1000
export const MIN_15 = 15 * 60 * 1000

export class MemoryAdapter implements ICacheAdapter {
  private cache = new Map<string, unknown>()

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, value)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

const memoryCacheInstance = new CacheService(new MemoryAdapter())

export async function get(key: string): Promise<unknown | undefined> {
  return memoryCacheInstance.get(key)
}

export async function set(key: string, value: unknown, ttl = MIN_5): Promise<void> {
  await memoryCacheInstance.set(key, value, ttl)
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
  const defaultTTL = MIN_5

  // Return a new function that expects the actual async function
  const cachedFunction = async (...args: A): Promise<T> => {
    const cacheKey = options?.key ?? originalFunc.name
    const cacheTTL = options?.ttl ?? defaultTTL

    // Attempt to get from cache
    const cachedData = await get(cacheKey)
    if (cachedData !== undefined) {
      return cachedData as T
    }

    // Otherwise, call the original function, then store and return its result
    const result = (await originalFunc(...args)) as T
    await set(cacheKey, result, cacheTTL)
    return result
  }

  return cachedFunction
}

export class MemoryCache implements ILogger {
  logger = new Logger('MemoryCache')
  private cache = new CacheService(new MemoryAdapter())

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key)
  }

  async set(key: string, value: unknown, ttl = MIN_5): Promise<void> {
    await this.cache.set(key, value, ttl)
  }
}
