export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function parsePort(value: unknown, fallback: number): number
export function parsePort(value: unknown): number | undefined
export function parsePort(
  value: unknown,
  fallback?: number | undefined
): number | undefined
export function parsePort(
  value: unknown,
  fallback?: number | undefined
): number | undefined {
  if (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= 65535
  ) {
    return value
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number.parseInt(trimmed, 10)
      if (parsed > 0 && parsed <= 65535) return parsed
    }
  }
  return fallback
}

export function parseScopes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => nonEmptyString(item))
      .filter((item): item is string => item !== undefined)
  }
  const asString = nonEmptyString(value)
  if (asString) {
    return asString.split(/[\s,]+/).filter(Boolean)
  }
  return []
}
