/**
 * Abstract interface for various storage solutions
 * Supports: localStorage, sessionStorage, cookies, IndexedDB, memory, etc.
 */
export interface IStorage {
  /**
   * Retrieve a value from storage
   * @template T - Type of the stored value
   * @param key - Storage key
   * @returns The stored value or undefined if not found
   */
  get<T>(key: string): Promise<T | undefined>

  /**
   * Store a value in storage
   * @template T - Type of the value to store
   * @param key - Storage key
   * @param value - Value to store
   * @param ttl - Time to live in milliseconds (optional)
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>

  /**
   * Delete a specific item from storage
   * @param key - Storage key to delete
   */
  delete(key: string): Promise<void>

  /**
   * Clear all items from storage
   */
  clear(): Promise<void>

  /**
   * Check if a key exists in storage
   * @param key - Storage key
   * @returns True if key exists, false otherwise
   */
  has(key: string): Promise<boolean>

  /**
   * Get all keys stored in storage
   * @returns Array of all keys
   */
  keys(): Promise<string[]>

  /**
   * Get the number of items in storage
   * @returns Number of stored items
   */
  size(): Promise<number>
}
