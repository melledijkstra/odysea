import browser from 'webextension-polyfill'
import type { ICacheAdapter } from './cache-service'

export class ExtensionStorageAdapter implements ICacheAdapter {
  private storageArea: browser.Storage.StorageArea

  constructor(storageArea: browser.Storage.StorageArea = browser.storage.local) {
    this.storageArea = storageArea
  }

  async get<T>(key: string): Promise<T | undefined> {
    const res = await this.storageArea.get(key)
    return res[key] as T | undefined
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.storageArea.set({ [key]: value })
  }

  async delete(key: string): Promise<void> {
    await this.storageArea.remove(key)
  }

  async clear(): Promise<void> {
    await this.storageArea.clear()
  }
}
