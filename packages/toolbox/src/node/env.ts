import fs from 'node:fs'
import { getErrorMessage } from '../error'
import { Logger } from '../logger'
import { nonEmptyString } from '../parse'
import { expandHomePath } from './paths'

const logger = new Logger('ToolboxEnv')

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

const VALID_ENV_KEY_REGEX = /^[\w.-]+$/

function unescapeDoubleQuoted(value: string): string {
  return value.replace(/\\([nrt"\\])/g, (_match, ch: string) => {
    switch (ch) {
      case 'n':
        return '\n'
      case 'r':
        return '\r'
      case 't':
        return '\t'
      case '"':
        return '"'
      case '\\':
        return '\\'
      default:
        return ch
    }
  })
}

function findLineEnd(text: string, from: number): number {
  const nl = text.indexOf('\n', from)
  return nl === -1 ? text.length : nl
}

function skipHorizontalWhitespace(text: string, from: number): number {
  let index = from
  while (index < text.length && (text[index] === ' ' || text[index] === '\t')) {
    index++
  }
  return index
}

function parseKey(rawHeader: string): string | undefined {
  let key = rawHeader.trim()
  if (key.startsWith('export') && (key[6] === ' ' || key[6] === '\t')) {
    key = key.slice(6).trim()
  }
  if (!VALID_ENV_KEY_REGEX.test(key) || FORBIDDEN_KEYS.has(key)) {
    return undefined
  }
  return key
}

function parseQuotedValue(
  text: string,
  quoteIndex: number
): { value: string; nextIndex: number } | undefined {
  const quote = text[quoteIndex]
  let index = quoteIndex + 1

  while (index < text.length) {
    const ch = text[index]
    if (quote === '"' && ch === '\\' && index + 1 < text.length) {
      index += 2
      continue
    }
    if (ch === quote) {
      const lineEnd = findLineEnd(text, index + 1)
      const trailing = text.slice(index + 1, lineEnd).trim()
      if (trailing.length > 0 && !trailing.startsWith('#')) {
        return undefined
      }
      const rawValue = text.slice(quoteIndex + 1, index)
      const value = quote === '"' ? unescapeDoubleQuoted(rawValue) : rawValue
      return { value, nextIndex: lineEnd + 1 }
    }
    index++
  }

  return undefined
}

function parseUnquotedValue(
  text: string,
  startIndex: number
): { value: string; nextIndex: number } {
  const lineEnd = findLineEnd(text, startIndex)
  const rawLine = text.slice(startIndex, lineEnd)
  const commentIndex = rawLine.indexOf('#')
  const rawValue =
    commentIndex === -1 ? rawLine : rawLine.slice(0, commentIndex)
  return { value: rawValue.trim(), nextIndex: lineEnd + 1 }
}

const QUOTE_CHARS = new Set(['"', "'", '`'])

function parseEnvEntry(
  text: string,
  startIndex: number,
  lineEnd: number
): { key: string | undefined; value: string; nextIndex: number } | undefined {
  const eqIndex = text.indexOf('=', startIndex)
  if (eqIndex === -1 || eqIndex > lineEnd) {
    return undefined
  }

  const key = parseKey(text.slice(startIndex, eqIndex))
  const valueStart = skipHorizontalWhitespace(text, eqIndex + 1)
  const firstChar = text[valueStart]

  const parsed =
    firstChar !== undefined && QUOTE_CHARS.has(firstChar)
      ? parseQuotedValue(text, valueStart)
      : parseUnquotedValue(text, valueStart)

  if (!parsed) {
    return undefined
  }

  return { key, value: parsed.value, nextIndex: parsed.nextIndex }
}

export function parseEnvContent(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  const withoutBom = content.startsWith('\uFEFF') ? content.slice(1) : content
  const normalized = withoutBom.replaceAll('\r\n', '\n').replaceAll('\r', '\n')

  let index = 0
  while (index < normalized.length) {
    index = skipHorizontalWhitespace(normalized, index)
    if (index >= normalized.length) break

    const lineEnd = findLineEnd(normalized, index)
    const ch = normalized[index]
    if (ch === '\n' || ch === '#') {
      index = lineEnd + 1
      continue
    }

    const entry = parseEnvEntry(normalized, index, lineEnd)
    if (!entry) {
      index = lineEnd + 1
      continue
    }

    if (entry.key !== undefined) {
      result[entry.key] = entry.value
    }
    index = entry.nextIndex
  }

  return result
}

/**
 * Reads and parses a `.env` file into a key-value map without mutating `process.env`.
 * Returns `{}` if the file does not exist or cannot be read.
 */
export function readEnvFile(filePath: string): Record<string, string> {
  const resolvedPath = expandHomePath(filePath)
  if (!fs.existsSync(resolvedPath)) {
    return {}
  }
  try {
    const content = fs.readFileSync(resolvedPath, 'utf8')
    return parseEnvContent(content)
  } catch (error: unknown) {
    logger.error(
      `Failed to read env file ${resolvedPath}: ${getErrorMessage(error)}`
    )
    return {}
  }
}

/**
 * Creates a lookup function that resolves environment variables across ordered
 * sources (highest priority first), skipping `undefined` and blank/whitespace values.
 */
export function createLayeredEnvResolver(
  sources: ReadonlyArray<Record<string, string | undefined>>
): (key: string) => string | undefined {
  return (key: string): string | undefined => {
    for (const source of sources) {
      if (!Object.hasOwn(source, key)) continue
      const value = nonEmptyString(source[key])
      if (value !== undefined) {
        return value
      }
    }
    return undefined
  }
}
