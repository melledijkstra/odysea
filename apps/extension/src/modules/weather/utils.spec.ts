import { describe, it, expect } from 'vitest'
import {
  computeTempMarkerPercent,
  computeTempRangeBar,
  formatDayName,
  formatHour,
  formatRelativeUpdatedAt,
  formatTime,
} from './utils'

describe('weather utils', () => {
  it('formats times and hours with timezone offset', () => {
    // 2026-04-29T06:15:00Z
    const unix = Date.UTC(2026, 3, 29, 6, 15, 0) / 1000
    expect(formatTime(unix, 7200)).toBe('08:15')
    expect(formatHour(unix, 7200)).toBe('08:00')
  })

  it('formats day names with Today for index 0', () => {
    // 2026-04-29 is Wednesday
    const wed = Date.UTC(2026, 3, 29, 12, 0, 0) / 1000
    const thu = Date.UTC(2026, 3, 30, 12, 0, 0) / 1000
    expect(formatDayName(wed, 0, 0)).toBe('Today')
    expect(formatDayName(thu, 0, 1)).toBe('Thu')
  })

  it('formats relative updated timestamp', () => {
    const now = 1_000_000_000
    expect(formatRelativeUpdatedAt(undefined, now)).toBe('')
    expect(formatRelativeUpdatedAt(now - 20_000, now)).toBe('Updated just now')
    expect(formatRelativeUpdatedAt(now - 5 * 60_000, now)).toBe(
      'Updated 5m ago'
    )
    expect(formatRelativeUpdatedAt(now - 2 * 3_600_000, now)).toBe(
      'Updated 2h ago'
    )
  })

  it('computes temperature range bar percentages', () => {
    expect(computeTempRangeBar(10, 20, 10, 30)).toEqual({
      leftPercent: 0,
      widthPercent: 50,
    })
    expect(computeTempRangeBar(15, 25, 10, 30)).toEqual({
      leftPercent: 25,
      widthPercent: 50,
    })
    expect(computeTempRangeBar(15, 15, 15, 15)).toEqual({
      leftPercent: 0,
      widthPercent: 100,
    })
  })

  it('computes current temperature marker percentage', () => {
    expect(computeTempMarkerPercent(20, 10, 30)).toBe(50)
    expect(computeTempMarkerPercent(5, 10, 30)).toBe(0)
    expect(computeTempMarkerPercent(15, 15, 15)).toBe(50)
  })
})
