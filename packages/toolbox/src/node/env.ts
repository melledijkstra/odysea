import fs from 'node:fs'
import { getErrorMessage } from '../error'
import { Logger } from '../logger'
import { nonEmptyString } from '../parse'
import { expandHomePath } from './paths'

const logger = new Logger('ToolboxEnv')

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

const ENV_LINE_REGEX =
  /^[ \t]*(?:export[ \t]+)?([\w.-]+)[ \t]*=[ \t]*('[^']*'|"(?:\\[\s\S]|[^"\\])*"|`[^`]*`|[^#\r\n]*?)?[ \t]*(?:#[^\r\n]*)?$/gm

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

export function parseEnvContent(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')

  for (const match of normalized.matchAll(ENV_LINE_REGEX)) {
    const key = match[1]
    if (!key || FORBIDDEN_KEYS.has(key)) continue

    let value = (match[2] ?? '').trim()
    const quote = value[0]
    if (
      (quote === '"' || quote === "'" || quote === '`') &&
      value.length >= 2 &&
      value[value.length - 1] === quote
    ) {
      value = value.slice(1, -1)
      if (quote === '"') {
        value = unescapeDoubleQuoted(value)
      }
    }

    result[key] = value
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
