import { getActiveTab } from '@melledijkstra/extension'
import { Logger } from '@/logger'

const LOCK_KEY = 'music-player-tab-lock'

const storage = localStorage

const logger = new Logger('TabLock')

export async function acquireTabLock(): Promise<boolean> {
  const tab = await getActiveTab()
  const tabId = tab.id?.toString() ?? ''
  const existing = storage.getItem(LOCK_KEY)

  logger.log(tabId, existing)

  if (!existing) {
    storage.setItem(LOCK_KEY, tabId)
    logger.log('acquired tab lock', tabId)
    return true
  }

  return existing === tabId
}

export async function hasTabLockAcquired(): Promise<boolean> {
  const tab = await getActiveTab()
  const tabId = tab.id?.toString() ?? ''
  const existing = storage.getItem(LOCK_KEY)
  logger.log('hasLockAcquired', tabId, existing, existing === tabId)
  return existing === tabId
}

export function lockExists(): boolean {
  return storage.getItem(LOCK_KEY) !== null
}

export async function releaseTabLock(): Promise<boolean> {
  const tab = await getActiveTab()
  const tabId = tab.id?.toString() ?? ''
  const existing = storage.getItem(LOCK_KEY)

  // only allow releasing the lock if it's the same tab that acquired it
  if (existing && existing === tabId) {
    storage.removeItem(LOCK_KEY)
    logger.log('released tab lock', tabId)
    return true
  }
  return false
}
