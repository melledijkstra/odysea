import { describe, it, expect } from 'vitest'
import { addDays, formatDate } from './date'

describe('addDays', () => {
  it('should add days to a date', () => {
    const date = new Date('2023-01-01')
    const result = addDays(date, 5)
    expect(result.toISOString().split('T')[0]).toBe('2023-01-06')
  })

  it('should subtract days from a date', () => {
    const date = new Date('2023-01-06')
    const result = addDays(date, -5)
    expect(result.toISOString().split('T')[0]).toBe('2023-01-01')
  })

  it('should handle month transitions', () => {
    const date = new Date('2023-01-31')
    const result = addDays(date, 1)
    expect(result.toISOString().split('T')[0]).toBe('2023-02-01')
  })

  it('should handle year transitions', () => {
    const date = new Date('2023-12-31')
    const result = addDays(date, 1)
    expect(result.toISOString().split('T')[0]).toBe('2024-01-01')
  })

  it('should not mutate the original date', () => {
    const date = new Date('2023-01-01')
    addDays(date, 5)
    expect(date.toISOString().split('T')[0]).toBe('2023-01-01')
  })
})

describe('formatDate', () => {
  it('should format a date as YYYY-MM-DD', () => {
    const date = new Date('2023-01-01T12:00:00Z')
    expect(formatDate(date)).toBe('2023-01-01')
  })
})
