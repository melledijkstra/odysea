const CACHE_NAME = 'image-cache'
const MAX_ENTRIES = 20 // max number of images
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 7 days

export async function trimCache() {
  const cache = await caches.open(CACHE_NAME)
  const requests = await cache.keys()
  const now = Date.now()

  // 1) Remove by age (using server Date header if present)
  await Promise.allSettled(
    requests.map(async (req) => {
      const resp = await cache.match(req)
      if (!resp) return
      const dateHdr = resp.headers.get('Date')
      if (dateHdr) {
        const fetchedAt = new Date(dateHdr).getTime()
        if (now - fetchedAt > MAX_AGE_SECONDS * 1000) {
          await cache.delete(req)
        }
      }
    }),
  )

  // 2) Enforce max entries (oldest-first)
  const remaining = await cache.keys()
  if (remaining.length > MAX_ENTRIES) {
    const toDelete = remaining.slice(0, remaining.length - MAX_ENTRIES)
    await Promise.allSettled(toDelete.map(req => cache.delete(req)))
  }
}
