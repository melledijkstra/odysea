import { Logger } from '@/logger'

export interface ICacheAdapter {
  get<T>(key: string): Promise<T | null | undefined> | T | null | undefined
  set<T>(key: string, value: T): Promise<void> | void
  delete(key: string): Promise<void> | void
  clear(): Promise<void> | void
}

export interface ICacheService {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

export type CacheItem<T> = {
  value: T
  expiry?: number // expiry timestamp in ms
}

function isCacheItem<T>(obj: unknown): obj is CacheItem<T> {
  return obj !== null && typeof obj === 'object' && 'value' in obj
}

export class CacheService implements ICacheService {
  private logger = new Logger('CacheService')
  private adapter: ICacheAdapter

  constructor(adapter: ICacheAdapter) {
    this.adapter = adapter
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const cached = await this.adapter.get<unknown>(key)
      if (cached === null || cached === undefined) {
        return undefined
      }

      // Check if it's in the new CacheItem wrap format
      if (isCacheItem<T>(cached)) {
        if (cached.expiry !== undefined && Date.now() > cached.expiry) {
          this.logger.log('Cache expired for key:', key)
          await this.delete(key)
          return undefined
        }
        return cached.value as T
      }

      // Fallback for older non-wrapped format
      return cached as T
    }
    catch (e) {
      this.logger.error('Failed to get from cache for key:', key, e)
      return undefined
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const item: CacheItem<T> = {
        value,
        expiry: ttl !== undefined ? Date.now() + ttl : undefined,
      }
      await this.adapter.set(key, item)
    }
    catch (e) {
      this.logger.error('Failed to set cache for key:', key, e)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.adapter.delete(key)
    }
    catch (e) {
      this.logger.error('Failed to delete cache for key:', key, e)
    }
  }

  async clear(): Promise<void> {
    try {
      await this.adapter.clear()
    }
    catch (e) {
      this.logger.error('Failed to clear cache:', e)
    }
  }
}
