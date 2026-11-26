export interface TrimWebCacheOptions {
  /** Maximum number of entries to retain (oldest entries are removed first). */
  maxEntries?: number
  /** Maximum age in seconds based on each cached response's `Date` header. */
  maxAgeSeconds?: number
}

/**
 * Trims a Web Cache API cache (`caches.open(cacheName)`) by removing entries
 * older than `maxAgeSeconds` (using the response `Date` header) and/or enforcing
 * a maximum entry count (`maxEntries`, evicting oldest-first).
 */
export async function trimWebCache(
  cacheName: string,
  options?: TrimWebCacheOptions
): Promise<void> {
  if (typeof caches === 'undefined') {
    return
  }

  const cache = await caches.open(cacheName)
  const now = Date.now()

  // 1) Remove by age (using response Date header if present)
  if (options?.maxAgeSeconds !== undefined) {
    const maxAgeMs = options.maxAgeSeconds * 1000
    const requests = await cache.keys()

    await Promise.allSettled(
      requests.map(async (req) => {
        const resp = await cache.match(req)
        if (!resp) return
        const dateHdr = resp.headers.get('Date')
        if (dateHdr) {
          const fetchedAt = new Date(dateHdr).getTime()
          if (!Number.isNaN(fetchedAt) && now - fetchedAt > maxAgeMs) {
            await cache.delete(req)
          }
        }
      })
    )
  }

  // 2) Enforce max entries (oldest-first)
  if (options?.maxEntries !== undefined && options.maxEntries >= 0) {
    const remaining = await cache.keys()
    if (remaining.length > options.maxEntries) {
      const toDelete = remaining.slice(0, remaining.length - options.maxEntries)
      await Promise.allSettled(toDelete.map((req) => cache.delete(req)))
    }
  }
}
