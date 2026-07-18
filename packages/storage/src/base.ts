import type { IStorage } from './storage.interface'

export abstract class BaseStorage implements IStorage {
  abstract get<T>(key: string): Promise<T | undefined>
  abstract set<T>(key: string, value: T, ttl?: number): Promise<void>
  abstract delete(key: string): Promise<void>
  abstract clear(): Promise<void>
  abstract keys(): Promise<string[]>

  async has(key: string): Promise<boolean> {
    const val = await this.get(key)
    return val !== undefined
  }

  async size(): Promise<number> {
    const keys = await this.keys()
    return keys.length
  }
}
