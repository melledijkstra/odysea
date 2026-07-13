import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CacheService } from './cache-service'
import { MemoryAdapter } from './memory'

describe('CacheService and Adapters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CacheService TTL and Expire Logic', () => {
    it('should retrieve non-expired cached value', async () => {
      const adapter = new MemoryAdapter()
      const service = new CacheService(adapter)

      await service.set('test', 'hello', 5000) // TTL 5 seconds
      const val = await service.get('test')
      expect(val).toBe('hello')
    })

    it('should expire and delete cached value after TTL', async () => {
      const adapter = new MemoryAdapter()
      const service = new CacheService(adapter)

      vi.useFakeTimers()
      await service.set('test', 'hello', 1000) // TTL 1 second
      
      // Fast forward time by 2 seconds
      vi.advanceTimersByTime(2000)

      const val = await service.get('test')
      expect(val).toBeUndefined()
      expect(adapter.get('test')).toBeUndefined()

      vi.useRealTimers()
    })

    it('should support no TTL (persistent cache)', async () => {
      const adapter = new MemoryAdapter()
      const service = new CacheService(adapter)

      await service.set('test', 'persistent')
      const val = await service.get('test')
      expect(val).toBe('persistent')
    })
  })

  describe('Backward compatibility', () => {
    it('should fall back to older non-wrapped format if value is not in CacheItem structure', async () => {
      const adapter = new MemoryAdapter()
      const service = new CacheService(adapter)

      // Directly put old format (raw string) into the adapter
      adapter.set('old-key', 'raw-value')
      
      const val = await service.get('old-key')
      expect(val).toBe('raw-value')
    })

    it('should fall back to older non-wrapped object format', async () => {
      const adapter = new MemoryAdapter()
      const service = new CacheService(adapter)

      // Put an old format object (like ImageInfo) directly into the adapter
      const rawObject = { id: '123', url: 'https://image.com' }
      adapter.set('old-key', rawObject)

      const val = await service.get<typeof rawObject>('old-key')
      expect(val).toEqual(rawObject)
    })
  })
})
