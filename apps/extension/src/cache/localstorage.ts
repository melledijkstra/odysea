import type { ICacheAdapter } from './cache-service'

export class LocalStorageAdapter implements ICacheAdapter {
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  }

  get<T>(key: string): T | null {
    if (!this.isAvailable()) return null
    const item = localStorage.getItem(key)
    if (item === null) return null
    try {
      return JSON.parse(item) as T
    }
    catch {
      return null
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isAvailable()) return
    localStorage.setItem(key, JSON.stringify(value))
  }

  delete(key: string): void {
    if (!this.isAvailable()) return
    localStorage.removeItem(key)
  }

  clear(): void {
    if (!this.isAvailable()) return
    localStorage.clear()
  }
}
