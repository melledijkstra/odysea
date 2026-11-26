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
