import { logger } from '@/logger'

export type VisibilityCallback = () => void

interface VisibilityOptions {
  /** If true, fires the callback immediately upon setup if the tab is visible */
  immediate?: boolean
}

/**
 * Executes a callback whenever the page becomes visible or regains window focus.
 * Returns an unbind function to remove event listeners cleanly.
 */
export function onPageVisible(
  callback: VisibilityCallback,
  options: VisibilityOptions = {}
): () => void {
  // Guard against non-browser environments (SSR)
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handleSync = () => {
    if (document.visibilityState === 'visible') {
      logger.debug('Page became visible, executing callback')
      callback()
    }
  }

  // Optionally trigger immediately if already visible
  if (options.immediate && document.visibilityState === 'visible') {
    callback()
  }

  window.addEventListener('visibilitychange', handleSync)

  // Return teardown function
  return () => {
    window.removeEventListener('visibilitychange', handleSync)
  }
}
