export function getBrowserLocale(): string | undefined {
  if (typeof navigator === 'undefined') {
    return
  }

  if (Array.isArray(navigator?.languages)) {
    return navigator.languages[0]
  }

  return navigator.language
}

export function repeatEvery(callback: () => void, interval: number) {
  // Check current time and calculate the delay until next interval
  const delay = interval - (Date.now() % interval)
  let intervalId: ReturnType<typeof setInterval>

  function start() {
    callback()
    intervalId = setInterval(callback, interval)
  }
  // Delay execution until it's an even interval
  const timeoutId = setTimeout(start, delay)

  return () => {
    if (timeoutId) clearTimeout(timeoutId)
    if (intervalId) clearInterval(intervalId)
  }
}

export function millisecondsToTime(milliseconds: number): string {
  return formatSeconds(milliseconds / 1000)
}

export function formatSeconds(seconds: number): string {
  const isNegative = seconds < 0

  const absoluteSeconds = Math.floor(Math.abs(seconds))
  const minutes = Math.floor(absoluteSeconds / 60)
  const remainingSeconds = absoluteSeconds % 60

  const formatted = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`

  return isNegative && absoluteSeconds > 0 ? `-${formatted}` : formatted
}

export function renderTimezone(timezone: string) {
  const browserLocale = getBrowserLocale()
  return new Date().toLocaleString(browserLocale, {
    timeStyle: 'short',
    timeZone: timezone,
  })
}

export function calculateRemainingDays(timestamp: number) {
  const a = new Date()
  const b = new Date(timestamp)
  const _MS_PER_DAY = 1000 * 60 * 60 * 24
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())

  return Math.floor((utc2 - utc1) / _MS_PER_DAY)
}

export function getTime(): string {
  const locale = getBrowserLocale()
  const date = new Date()
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Returns a string representing how much of the day has passed in percentage form.
 *
 * @returns A string such as "50%" indicating the percentage of the day that has passed.
 */
export function getTimePercentage(): string {
  const date = new Date()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  // 1440 minutes in a day
  return `${Math.round(((hours * 60 + minutes) / 1440) * 100)}%`
}

export function playbackLoop(
  callback: (position: number) => void,
  interval: number,
  initialPosition: number = 0
): () => void {
  let position = initialPosition

  const loop = setInterval(() => {
    position += interval
    callback(position)
  }, interval)

  return () => {
    clearInterval(loop)
  }
}

export function getMomentOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hours = new Date().getHours()
  let momentOfDay: 'morning' | 'afternoon' | 'evening'

  if (hours < 12) {
    momentOfDay = 'morning'
  } else if (hours < 18) {
    momentOfDay = 'afternoon'
  } else {
    momentOfDay = 'evening'
  }

  return momentOfDay
}

export const seconds = (n: number): number => n * 1000
export const minutes = (n: number): number => n * 60 * 1000
export const hours = (n: number): number => n * 60 * 60 * 1000
export const days = (n: number): number => n * 24 * 60 * 60 * 1000
export const weeks = (n: number): number => n * 7 * 24 * 60 * 60 * 1000

/**
 * Formats a duration in minutes into a human-readable string (e.g. "45m", "1h", "1h 30m").
 * Returns `fallback` (default: "No data") when input is undefined, negative, or non-finite.
 */
export function formatDurationMinutes(
  totalMinutes?: number,
  fallback: string = 'No data'
): string {
  if (
    totalMinutes === undefined ||
    !Number.isFinite(totalMinutes) ||
    totalMinutes < 0
  ) {
    return fallback
  }

  const floored = Math.floor(totalMinutes)
  const wholeHours = Math.floor(floored / 60)
  const remainingMins = floored % 60

  if (wholeHours === 0) {
    return `${remainingMins}m`
  }

  if (remainingMins === 0) {
    return `${wholeHours}h`
  }

  return `${wholeHours}h ${remainingMins}m`
}
