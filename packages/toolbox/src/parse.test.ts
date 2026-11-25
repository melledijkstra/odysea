import { describe, expect, it } from 'vitest'
import { isRecord, nonEmptyString, parsePort, parseScopes } from './parse'

describe('isRecord', () => {
  it('should return true for plain objects and null-prototype objects', () => {
    expect(isRecord({})).toBe(true)
    expect(isRecord({ a: 1 })).toBe(true)
    expect(isRecord(Object.create(null))).toBe(true)
  })

  it('should return false for null, arrays, primitives, and functions', () => {
    expect(isRecord(null)).toBe(false)
    expect(isRecord(undefined)).toBe(false)
    expect(isRecord([])).toBe(false)
    expect(isRecord([1])).toBe(false)
    expect(isRecord('str')).toBe(false)
    expect(isRecord(0)).toBe(false)
    expect(isRecord(42)).toBe(false)
    expect(isRecord(true)).toBe(false)
    expect(isRecord(() => {})).toBe(false)
  })
})

describe('nonEmptyString', () => {
  it('should return trimmed non-empty strings', () => {
    expect(nonEmptyString('hello')).toBe('hello')
    expect(nonEmptyString('  hello  ')).toBe('hello')
    expect(nonEmptyString('\tfoo\n')).toBe('foo')
  })

  it('should return undefined for blank strings and non-strings', () => {
    expect(nonEmptyString('')).toBeUndefined()
    expect(nonEmptyString('   ')).toBeUndefined()
    expect(nonEmptyString('\n\t')).toBeUndefined()
    expect(nonEmptyString(null)).toBeUndefined()
    expect(nonEmptyString(undefined)).toBeUndefined()
    expect(nonEmptyString(0)).toBeUndefined()
    expect(nonEmptyString(123)).toBeUndefined()
    expect(nonEmptyString(true)).toBeUndefined()
    expect(nonEmptyString({})).toBeUndefined()
    expect(nonEmptyString([])).toBeUndefined()
  })
})

describe('parsePort', () => {
  it('should parse valid integer ports with and without fallback', () => {
    expect(parsePort(1)).toBe(1)
    expect(parsePort(80)).toBe(80)
    expect(parsePort(3000)).toBe(3000)
    expect(parsePort(65535)).toBe(65535)
    expect(parsePort(8080, 3000)).toBe(8080)
  })

  it('should parse valid numeric string ports', () => {
    expect(parsePort('80')).toBe(80)
    expect(parsePort(' 8080 ')).toBe(8080)
    expect(parsePort('65535')).toBe(65535)
    expect(parsePort('0080')).toBe(80)
  })

  it('should return undefined for invalid values when no fallback is provided', () => {
    expect(parsePort(0)).toBeUndefined()
    expect(parsePort(-1)).toBeUndefined()
    expect(parsePort(65536)).toBeUndefined()
    expect(parsePort(3000.5)).toBeUndefined()
    expect(parsePort(Number.NaN)).toBeUndefined()
    expect(parsePort(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(parsePort('0')).toBeUndefined()
    expect(parsePort('-80')).toBeUndefined()
    expect(parsePort('65536')).toBeUndefined()
    expect(parsePort('3000abc')).toBeUndefined()
    expect(parsePort('abc')).toBeUndefined()
    expect(parsePort('')).toBeUndefined()
    expect(parsePort('   ')).toBeUndefined()
    expect(parsePort(null)).toBeUndefined()
    expect(parsePort(undefined)).toBeUndefined()
    expect(parsePort({})).toBeUndefined()
    expect(parsePort(true)).toBeUndefined()
  })

  it('should return concrete fallback number when fallback is provided', () => {
    const resolved: number = parsePort('invalid', 3000)
    expect(resolved).toBe(3000)
    expect(parsePort(undefined, 5050)).toBe(5050)
    expect(parsePort(0, 3000)).toBe(3000)
    expect(parsePort(70000, 3000)).toBe(3000)
  })
})

describe('parseScopes', () => {
  it('should split space-delimited strings', () => {
    expect(parseScopes('openid profile email')).toEqual([
      'openid',
      'profile',
      'email',
    ])
    expect(parseScopes('  openid   email\tprofile\n')).toEqual([
      'openid',
      'email',
      'profile',
    ])
  })

  it('should split comma-delimited and mixed-delimiter strings', () => {
    expect(parseScopes('repo,read:user')).toEqual(['repo', 'read:user'])
    expect(parseScopes('openid, email profile')).toEqual([
      'openid',
      'email',
      'profile',
    ])
  })

  it('should trim and filter array inputs', () => {
    expect(parseScopes(['openid', '  email  ', '', '   ', 123, null])).toEqual([
      'openid',
      'email',
    ])
  })

  it('should return an empty array for empty or non-string inputs', () => {
    expect(parseScopes(undefined)).toEqual([])
    expect(parseScopes('')).toEqual([])
    expect(parseScopes('   ')).toEqual([])
    expect(parseScopes(', , ')).toEqual([])
    expect(parseScopes([])).toEqual([])
    expect(parseScopes(['  '])).toEqual([])
    expect(parseScopes(null)).toEqual([])
    expect(parseScopes(123)).toEqual([])
    expect(parseScopes({})).toEqual([])
  })
})
