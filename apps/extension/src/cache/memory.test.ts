import { describe, expect, it } from 'vitest'
import { MemoryAdapter } from './memory'

describe('MemoryAdapter', () => {
  it('should set and get values correctly', () => {
    const adapter = new MemoryAdapter()
    adapter.set('foo', 'bar')
    expect(adapter.get('foo')).toBe('bar')
  })

  it('should delete keys correctly', () => {
    const adapter = new MemoryAdapter()
    adapter.set('foo', 'bar')
    adapter.delete('foo')
    expect(adapter.get('foo')).toBeUndefined()
  })

  it('should clear all keys', () => {
    const adapter = new MemoryAdapter()
    adapter.set('foo', 'bar')
    adapter.set('baz', 'qux')
    adapter.clear()
    expect(adapter.get('foo')).toBeUndefined()
    expect(adapter.get('baz')).toBeUndefined()
  })
})
