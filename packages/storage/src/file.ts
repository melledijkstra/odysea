import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { IStorage } from './storage.interface'

type FileCacheItem<T> = {
  data: T
  timestamp: number
  ttl: number
}

export class FileStorage implements IStorage {
  private filePath: string

  constructor(filePath?: string) {
    if (filePath) {
      this.filePath = filePath.startsWith('~')
        ? path.join(os.homedir(), filePath.slice(1))
        : path.resolve(filePath)
    }
    else {
      this.filePath = path.join(os.homedir(), '.toolbox-storage.json')
    }
  }

  private readStore(): Record<string, FileCacheItem<unknown> | undefined> {
    if (!fs.existsSync(this.filePath)) {
      return {}
    }
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8')
      return JSON.parse(data)
    }
    catch {
      return {}
    }
  }

  private writeStore(store: Record<string, FileCacheItem<unknown> | undefined>): void {
    const dir = path.dirname(this.filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const fileExists = fs.existsSync(this.filePath)
    fs.writeFileSync(this.filePath, JSON.stringify(store, null, 2), 'utf-8')

    if (!fileExists && os.platform() !== 'win32') {
      try {
        fs.chmodSync(this.filePath, 0o600)
      }
      catch {
        // Ignored if permissions cannot be set (e.g. unsupported fs)
      }
    }
  }

  private isExpired(item: FileCacheItem<unknown>): boolean {
    if (item.ttl === Infinity || item.ttl === null || item.ttl === undefined || String(item.ttl) === 'Infinity') return false
    return Date.now() - item.timestamp > item.ttl
  }

  async get<T>(key: string): Promise<T | undefined> {
    const store = this.readStore()
    const item = store[key]
    if (!item) {
      return undefined
    }

    if (this.isExpired(item)) {
      await this.delete(key)
      return undefined
    }

    return item.data as T
  }

  async set<T>(key: string, value: T, ttl = Infinity): Promise<void> {
    const store = this.readStore()
    store[key] = {
      data: value,
      timestamp: Date.now(),
      ttl,
    }
    this.writeStore(store)
  }

  async delete(key: string): Promise<void> {
    const store = this.readStore()
    if (key in store) {
      delete store[key]
      this.writeStore(store)
    }
  }

  async clear(): Promise<void> {
    this.writeStore({})
  }

  async has(key: string): Promise<boolean> {
    const val = await this.get(key)
    return val !== undefined
  }

  async keys(): Promise<string[]> {
    const store = this.readStore()
    const activeKeys: string[] = []
    for (const key of Object.keys(store)) {
      const item = store[key]
      if (item && !this.isExpired(item)) {
        activeKeys.push(key)
      }
      else if (item) {
        // clean up expired items
        await this.delete(key)
      }
    }
    return activeKeys
  }

  async size(): Promise<number> {
    const activeKeys = await this.keys()
    return activeKeys.length
  }
}
