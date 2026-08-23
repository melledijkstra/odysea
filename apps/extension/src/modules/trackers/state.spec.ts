import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Countdown } from './countdown/countdown.svelte'
import { Counter } from './counter/counter.svelte'
import { Gmail } from './gmail/gmail.svelte'
import { Sleep } from './sleep/sleep.svelte'
import { Trackers } from './state.svelte'
import type { AnyTracker } from './types'
import { WorldClock } from './worldclock/worldclock.svelte'

describe('Trackers', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes with empty metrics if localStorage is empty', () => {
    const trackers = new Trackers()
    expect(trackers.metrics).toEqual([])
  })

  it('loads metrics from localStorage and instantiates correct classes', () => {
    const mockMetrics: AnyTracker[] = [
      { id: '1', type: 'counter', name: 'Test', value: 10, pinned: true },
    ]
    localStorage.setItem('metrics', JSON.stringify(mockMetrics))

    const trackers = new Trackers()
    expect(trackers.metrics).toHaveLength(1)
    expect(trackers.metrics[0]).toBeInstanceOf(Counter)
    expect(trackers.metrics[0].formatValue()).toBe('10')
    expect(trackers.metrics.map((m) => m.toJSON())).toEqual(mockMetrics)
  })

  it('adds and stores a counter metric', () => {
    const trackers = new Trackers()
    trackers.addCounter('My Counter', 5, false)

    expect(trackers.metrics).toHaveLength(1)
    const counterMetric = trackers.metrics[0]
    expect(counterMetric).toBeInstanceOf(Counter)
    expect(counterMetric.type).toBe('counter')
    if (counterMetric instanceof Counter) {
      expect(counterMetric.name).toBe('My Counter')
      expect(counterMetric.value).toBe(5)
      expect(counterMetric.formatValue()).toBe('5')
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
    expect(trackers.metrics).toHaveLength(1)
    expect(trackers.metrics[0]).toBeInstanceOf(Sleep)
    expect(trackers.metrics[0].id).toBe('sleep')

    trackers.setSleepEnabled(false)
    expect(trackers.sleepEnabled).toBe(false)
    expect(trackers.metrics).toHaveLength(0)
  })

  it('enables and disables gmail metric', () => {
    const trackers = new Trackers()
    expect(trackers.gmailEnabled).toBe(false)

    trackers.setGmailEnabled(true)
    expect(trackers.gmailEnabled).toBe(true)
    expect(trackers.metrics).toHaveLength(1)
    expect(trackers.metrics[0]).toBeInstanceOf(Gmail)
    expect(trackers.metrics[0].id).toBe('gmail')

    trackers.setGmailEnabled(false)
    expect(trackers.gmailEnabled).toBe(false)
    expect(trackers.metrics).toHaveLength(0)
  })

  it('deletes a metric by id', () => {
    const trackers = new Trackers()
    trackers.addWorldClock('NY', 'America/New_York', true)
    trackers.setSleepEnabled(true)

    expect(trackers.metrics).toHaveLength(2)
    expect(trackers.metrics[0]).toBeInstanceOf(WorldClock)
    const clockId = trackers.metrics.find((m) => m.type === 'worldClock')!.id

    trackers.deleteMetric(clockId)

    expect(trackers.metrics).toHaveLength(1)
    expect(trackers.metrics[0].id).toBe('sleep')
  })

  it('updates a metric', () => {
    const trackers = new Trackers()
    trackers.addCountdown('Vacation', '2025-01-01', false)
    const metricId = trackers.metrics[0].id

    trackers.pinMetric(metricId, true)

    expect(trackers.metrics[0].pinned).toBe(true)

    trackers.updateMetric(metricId, { name: 'Holiday' })

    expect(trackers.metrics[0]).toBeInstanceOf(Countdown)
    expect(trackers.metrics[0].type).toBe('countdown')
    if (trackers.metrics[0] instanceof Countdown) {
      expect(trackers.metrics[0].name).toBe('Holiday')
    }
  })
})
