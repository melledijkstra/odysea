/**
 * Abstract interface for various storage solutions
 * Supports: localStorage, sessionStorage, cookies, IndexedDB, memory, etc.
 */
export type CacheItem<T> = {
  data: T
  timestamp: number
  ttl?: number
}
