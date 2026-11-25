export type VisibilityCallback = () => void

export interface PageVisibleOptions {
  /** If true, fires the callback immediately upon setup if the page is currently visible */
  immediate?: boolean
}

/**
 * Executes a callback whenever the document transitions to the visible state.
 * Safe to call in non-browser / SSR / Service Worker environments (returns a no-op cleanup).
 * Returns an idempotent teardown function that removes the event listener.
 */
export function onPageVisible(
  callback: VisibilityCallback,
  options: PageVisibleOptions = {}
): () => void {
  if (
    typeof document === 'undefined' ||
    typeof document.addEventListener !== 'function'
  ) {
    return () => {}
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      callback()
    }
  }

  // Invoke before attaching the listener so a synchronous throw does not leak a listener
  if (options.immediate && document.visibilityState === 'visible') {
    callback()
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  let disposed = false
  return () => {
    if (disposed) {
      return
    }
    disposed = true
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}
