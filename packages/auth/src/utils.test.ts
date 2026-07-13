import { describe, it, expect } from 'vitest'
import { generateRandomString, sha256, base64encode } from './utils'

describe('generateRandomString', () => {
  it('should generate a string of the specified length', () => {
    const length = 10
    const str = generateRandomString(length)
    expect(str).toBeTypeOf('string')
    expect(str.length).toBe(length)
  })

  it('should generate different strings', () => {
    const str1 = generateRandomString(20)
    const str2 = generateRandomString(20)
    expect(str1).not.toBe(str2)
  })
})

describe('sha256', () => {
  it('should generate a SHA-256 hash', async () => {
    const seed = 'test'
    const hash = await sha256(seed)
    expect(hash).toBeInstanceOf(ArrayBuffer)
    expect(hash.byteLength).toBe(32) // SHA-256 produces 32 bytes
  })

  it('should produce the same hash for the same input', async () => {
    const seed = 'test'
    const hash1 = await sha256(seed)
    const hash2 = await sha256(seed)
    // Compare ArrayBuffers
    expect(new Uint8Array(hash1)).toEqual(new Uint8Array(hash2))
  })
})

describe('base64encode', () => {
  it('should base64url encode an ArrayBuffer', () => {
    // 'hello world' in ascii
    const input = new Uint8Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100])
    const result = base64encode(input.buffer)
    // base64 for 'hello world' is 'aGVsbG8gd29ybGQ='
    // base64url should strip '=' and replace +/
    expect(result).toBe('aGVsbG8gd29ybGQ')
  })

  it('should handle special characters', () => {
    // Test vectors that produce + and / in standard base64
    // Subject: \xff\xff
    // Base64: //8=
    // Base64URL: __8
    const input = new Uint8Array([255, 255])
    const result = base64encode(input.buffer)
    expect(result).toBe('__8')
  })
})
