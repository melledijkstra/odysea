import { describe, expect, it } from 'vitest'
import { capitalize, slugify } from './string'

describe('slugify', () => {
  it('should return empty string for empty or whitespace-only inputs', () => {
    expect(slugify('')).toBe('')
    expect(slugify('   ')).toBe('')
  })

  it('should convert basic text to lowercase kebab-case', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('should strip accents and diacritics', () => {
    expect(slugify('Café Crème Über')).toBe('cafe-creme-uber')
  })

  it('should replace special characters and punctuation cleanly', () => {
    expect(slugify('Hello, World! (2026) — #1')).toBe('hello-world-2026-1')
  })

  it('should collapse multiple spaces and hyphens', () => {
    expect(slugify('  foo   --  bar---baz  ')).toBe('foo-bar-baz')
  })

  it('should strip leading and trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello')
    expect(slugify('---')).toBe('')
    expect(slugify('- Intro')).toBe('intro')
  })

  it('should leave already-slugified strings unchanged', () => {
    expect(slugify('already-a-slug-123')).toBe('already-a-slug-123')
  })

  it('should return empty string for punctuation-only input', () => {
    expect(slugify('!!!@@@')).toBe('')
  })
})

describe('capitalize', () => {
  it('should handle empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('should capitalize the first character while leaving the rest unchanged', () => {
    expect(capitalize('google')).toBe('Google')
    expect(capitalize('Google')).toBe('Google')
    expect(capitalize('g')).toBe('G')
    expect(capitalize('hello world')).toBe('Hello world')
    expect(capitalize('camelCase')).toBe('CamelCase')
  })

  it('should leave leading digits and whitespace unchanged', () => {
    expect(capitalize('123abc')).toBe('123abc')
    expect(capitalize('  leading')).toBe('  leading')
  })
})
