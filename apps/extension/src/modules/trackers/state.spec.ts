import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Trackers } from './state.svelte'
import type { AnyMetric } from './types'

describe('Trackers', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes with empty metrics if localStorage is empty', () => {
    const trackers = new Trackers()
    expect(trackers.allMetrics).toEqual([])
  })

  it('loads metrics from localStorage', () => {
    const mockMetrics: AnyMetric[] = [
      { id: '1', type: 'counter', name: 'Test', value: 10, pinned: true },
    ]
    localStorage.setItem('metrics', JSON.stringify(mockMetrics))

    const trackers = new Trackers()
    expect(trackers.allMetrics).toEqual(mockMetrics)
  })

  it('adds and stores a counter metric', () => {
    const trackers = new Trackers()
    trackers.addCounter('My Counter', 5, false)

    expect(trackers.allMetrics).toHaveLength(1)
    const counterMetric = trackers.allMetrics[0]
    expect(counterMetric.type).toBe('counter')
    if (counterMetric.type === 'counter') {
      expect(counterMetric.name).toBe('My Counter')
      expect(counterMetric.value).toBe(5)
      expect(counterMetric.pinned).toBe(false)
      expect(counterMetric.id).toBeDefined()
    }

    const stored = JSON.parse(localStorage.getItem('metrics') || '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe(counterMetric.id)
  })

  it('enables and disables sleep metric', () => {
    const trackers = new Trackers()
    expect(trackers.sleepEnabled).toBe(false)

    trackers.setSleepEnabled(true)
    expect(trackers.sleepEnabled).toBe(true)
    expect(trackers.allMetrics).toHaveLength(1)
    expect(trackers.allMetrics[0].id).toBe('sleep')

    trackers.setSleepEnabled(false)
    expect(trackers.sleepEnabled).toBe(false)
    expect(trackers.allMetrics).toHaveLength(0)
  })

  it('deletes a metric by id', () => {
    const trackers = new Trackers()
    trackers.addWorldClock('NY', 'America/New_York', true)
    trackers.setSleepEnabled(true)

    expect(trackers.allMetrics).toHaveLength(2)
    const clockId = trackers.allMetrics.find((m) => m.type === 'worldClock')!.id

    trackers.deleteMetric(clockId)

    expect(trackers.allMetrics).toHaveLength(1)
    expect(trackers.allMetrics[0].id).toBe('sleep')
  })

  it('updates a metric', () => {
    const trackers = new Trackers()
    trackers.addCountdown('Vacation', '01/01/2025', false)
    const metricId = trackers.allMetrics[0].id

    trackers.pinMetric(metricId, true)

    expect(trackers.allMetrics[0].pinned).toBe(true)

    trackers.updateMetric(metricId, { name: 'Holiday' })

    expect(trackers.allMetrics[0].type).toBe('countdown')
    if (trackers.allMetrics[0].type === 'countdown') {
      expect(trackers.allMetrics[0].name).toBe('Holiday')
    }
  })
})
