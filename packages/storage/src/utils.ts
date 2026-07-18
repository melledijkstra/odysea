import { CacheItem } from './types'

export const isCacheItem = (item: unknown): item is CacheItem<unknown> => {
  if (!item || typeof item !== 'object') return false
  const cacheItem = item as CacheItem<unknown>
  return 'data' in cacheItem && 'timestamp' in cacheItem
}

export const isExpired = (item: CacheItem<unknown>): boolean => {
  if (!item) return true
  const now = Date.now()
  return (
    typeof item.ttl === 'number' &&
    item.ttl > 0 &&
    now - item.timestamp > item.ttl
  )
}

// Utility functions to convert time units to milliseconds
export const minutes = (n: number) => n * 60 * 1000
export const seconds = (n: number) => n * 1000
export const hours = (n: number) => n * 60 * 60 * 1000
export const days = (n: number) => n * 24 * 60 * 60 * 1000
export const weeks = (n: number) => n * 7 * 24 * 60 * 60 * 1000
