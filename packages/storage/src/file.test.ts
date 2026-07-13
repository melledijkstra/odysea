import { describe, vi, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { FileStorage } from './file'

describe('FileStorage', () => {
  let tempFilePath: string
  let storage: FileStorage

  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeEach(() => {
    tempFilePath = path.join(os.tmpdir(), `test-toolbox-storage-${Math.random().toString(36).substring(2)}.json`)
    storage = new FileStorage(tempFilePath)
  })

  afterEach(() => {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
    }
    catch {
      // Ignored
    }
  })

  it('should cache and retrieve values', async () => {
    await storage.set('foo', 'bar')
    expect(await storage.get('foo')).toBe('bar')
    expect(fs.existsSync(tempFilePath)).toBe(true)
  })

  it('should remove expired values', async () => {
    await storage.set('foo', 'bar', 5000)
    expect(await storage.get('foo')).toBe('bar')

    vi.advanceTimersByTime(6000)

    expect(await storage.get('foo')).toBe(undefined)
  })

  it('should not remove non-expired values', async () => {
    await storage.set('foo', 'bar', 5000)

    vi.advanceTimersByTime(2500)

    expect(await storage.get('foo')).toBe('bar')
  })

  it('should report has/keys/size correctly', async () => {
    await storage.set('a', 1)
    await storage.set('b', 2, 5000)

    expect(await storage.has('a')).toBe(true)
    expect(await storage.has('b')).toBe(true)
    expect(await storage.size()).toBe(2)
    expect(await storage.keys()).toEqual(['a', 'b'])

    vi.advanceTimersByTime(6000)

    expect(await storage.has('b')).toBe(false)
    expect(await storage.size()).toBe(1)
    expect(await storage.keys()).toEqual(['a'])
  })

  it('should delete keys', async () => {
    await storage.set('foo', 'bar')
    expect(await storage.get('foo')).toBe('bar')

    await storage.delete('foo')
    expect(await storage.get('foo')).toBe(undefined)
  })

  it('should clear all keys', async () => {
    await storage.set('foo', 'bar')
    await storage.set('baz', 'qux')

    await storage.clear()
    expect(await storage.get('foo')).toBe(undefined)
    expect(await storage.get('baz')).toBe(undefined)
    expect(await storage.size()).toBe(0)
  })

  it('should handle Windows and Unix paths (expand ~)', () => {
    const defaultStorage = new FileStorage()
    expect(defaultStorage['filePath']).toBe(path.join(os.homedir(), '.toolbox-storage.json'))

    const tildeStorage = new FileStorage('~/test.json')
    expect(tildeStorage['filePath']).toBe(path.join(os.homedir(), 'test.json'))
  })

  it('should set file permissions to 0600 on Unix systems', async () => {
    if (os.platform() === 'win32') {
      return
    }

    await storage.set('test', 'value')
    const stats = fs.statSync(tempFilePath)
    // Check if the permission includes only owner read/write (0600)
    // mask is 0o777 (which checks owner, group, other permissions)
    const mode = stats.mode & 0o777
    expect(mode).toBe(0o600)
  })
})
