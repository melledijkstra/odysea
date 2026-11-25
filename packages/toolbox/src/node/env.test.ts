import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createLayeredEnvResolver, parseEnvContent, readEnvFile } from './env'

describe('parseEnvContent and readEnvFile', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolbox-env-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should return an empty object when the env file does not exist', () => {
    expect(readEnvFile(path.join(tmpDir, 'missing.env'))).toEqual({})
  })

  it('should return an empty object without throwing when the target is a directory', () => {
    expect(readEnvFile(tmpDir)).toEqual({})
  })

  it('should parse standard keys, export prefix, whitespace, = in values, empty values, comments, BOM, and CRLF', () => {
    const content = [
      '\uFEFF# full-line comment',
      '  # indented comment',
      'PLAIN=value',
      'export EXPORTED = hello world  ',
      'WITH_EQUALS=a=b=c',
      'EMPTY_KEY=',
      'NEXT_KEY=after_empty',
      'INLINE_COMMENT=foo bar # trailing comment',
      '',
    ].join('\r\n')

    const envPath = path.join(tmpDir, '.env')
    fs.writeFileSync(envPath, content, 'utf8')

    expect(readEnvFile(envPath)).toEqual({
      PLAIN: 'value',
      EXPORTED: 'hello world',
      WITH_EQUALS: 'a=b=c',
      EMPTY_KEY: '',
      NEXT_KEY: 'after_empty',
      INLINE_COMMENT: 'foo bar',
    })
  })

  it('should preserve # and surrounding whitespace inside single, double, and backtick quotes', () => {
    const content = [
      "SINGLE='  hello # world  ' # comment",
      'DOUBLE="  foo # bar  " # comment',
      'BACKTICK=`  baz # qux  ` # comment',
    ].join('\n')

    expect(parseEnvContent(content)).toEqual({
      SINGLE: '  hello # world  ',
      DOUBLE: '  foo # bar  ',
      BACKTICK: '  baz # qux  ',
    })
  })

  it('should unescape sequences inside double quotes without double-unescaping', () => {
    const content = [
      'ESCAPED="line1\\nline2\\r\\t\\"quoted\\"\\\\end"',
      'LITERAL_BACKSLASH_N="\\\\n"',
      'TRAILING_BACKSLASH="trailing\\\\"',
      "SINGLE_NO_ESCAPE='line1\\nline2'",
    ].join('\n')

    expect(parseEnvContent(content)).toEqual({
      ESCAPED: 'line1\nline2\r\t"quoted"\\end',
      LITERAL_BACKSLASH_N: '\\n',
      TRAILING_BACKSLASH: 'trailing\\',
      SINGLE_NO_ESCAPE: 'line1\\nline2',
    })
  })

  it('should parse multiline quoted values', () => {
    const content = [
      'MULTI_DOUBLE="line1',
      'line2"',
      "MULTI_SINGLE='a",
      "b'",
      'AFTER=ok',
    ].join('\n')

    expect(parseEnvContent(content)).toEqual({
      MULTI_DOUBLE: 'line1\nline2',
      MULTI_SINGLE: 'a\nb',
      AFTER: 'ok',
    })
  })

  it('should let later duplicate keys overwrite earlier ones', () => {
    expect(parseEnvContent('DUP=1\nDUP=2\n')).toEqual({ DUP: '2' })
  })

  it('should ignore prototype-pollution keys', () => {
    const parsed = parseEnvContent(
      '__proto__=polluted\nconstructor=bad\nprototype=bad\nSAFE=ok\n'
    )
    expect(parsed).toEqual({ SAFE: 'ok' })
    expect(Object.hasOwn(parsed, '__proto__')).toBe(false)
    expect(Object.hasOwn(parsed, 'constructor')).toBe(false)
    expect(Object.hasOwn(parsed, 'prototype')).toBe(false)
  })
})

describe('createLayeredEnvResolver', () => {
  it('should resolve from highest-precedence source first', () => {
    const resolve = createLayeredEnvResolver([
      { API_KEY: 'from-process', ONLY_TOP: 'top' },
      { API_KEY: 'from-app', APP_KEY: 'app' },
      { API_KEY: 'from-shared', SHARED_KEY: 'shared' },
    ])

    expect(resolve('API_KEY')).toBe('from-process')
    expect(resolve('ONLY_TOP')).toBe('top')
    expect(resolve('APP_KEY')).toBe('app')
    expect(resolve('SHARED_KEY')).toBe('shared')
  })

  it('should fall through when higher-precedence sources have undefined, empty, or whitespace-only values', () => {
    const resolve = createLayeredEnvResolver([
      { KEY: undefined, BLANK: '', SPACES: '   ' },
      { KEY: '  ', BLANK: 'from-second', SPACES: '  from-second-trimmed  ' },
      { KEY: 'from-third' },
    ])

    expect(resolve('KEY')).toBe('from-third')
    expect(resolve('BLANK')).toBe('from-second')
    expect(resolve('SPACES')).toBe('from-second-trimmed')
  })

  it('should return undefined when absent, blank in all sources, or sources is empty', () => {
    const resolve = createLayeredEnvResolver([{ EMPTY: '' }, { EMPTY: '   ' }])
    expect(resolve('EMPTY')).toBeUndefined()
    expect(resolve('MISSING')).toBeUndefined()

    const emptyResolve = createLayeredEnvResolver([])
    expect(emptyResolve('ANY')).toBeUndefined()
  })

  it('should not resolve inherited Object.prototype keys', () => {
    const resolve = createLayeredEnvResolver([{ NORMAL: 'ok' }])
    expect(resolve('toString')).toBeUndefined()
    expect(resolve('constructor')).toBeUndefined()
    expect(resolve('hasOwnProperty')).toBeUndefined()
  })
})
