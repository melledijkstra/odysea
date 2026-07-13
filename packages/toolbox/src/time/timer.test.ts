import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Timer } from './timer'

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const timer = new Timer({ duration: 5000 })

      expect(timer.formatRemainingTime()).toBe('0:05')
    })

    it('should initialize with custom interval', () => {
      const timer = new Timer({ duration: 5000, interval: 500 })

      expect(timer.formatRemainingTime()).toBe('0:05')
    })

    it('should set up callbacks from options', () => {
      const onStart = vi.fn()
      const onTick = vi.fn()
      const onStop = vi.fn()
      const onComplete = vi.fn()

      const timer = new Timer({
        duration: 5000,
        onStart,
        onTick,
        onStop,
        onComplete,
      })

      expect(timer).toBeDefined()
    })
  })

  describe('start', () => {
    it('should start the timer and call onStart callback', () => {
      const onStart = vi.fn()
      const timer = new Timer({ duration: 5000, onStart })

      timer.start()

      expect(onStart).toHaveBeenCalledWith(5000)
    })

    it('should not start twice if already running', () => {
      const onStart = vi.fn()
      const timer = new Timer({ duration: 5000, onStart })

      timer.start()
      timer.start()

      expect(onStart).toHaveBeenCalledTimes(1)
    })

    it('should call onTick callback at interval', () => {
      const onTick = vi.fn()
      const timer = new Timer({ duration: 5000, onTick, interval: 1000 })

      timer.start()

      // First call happens immediately in runTick
      expect(onTick).toHaveBeenCalledTimes(1)

      vi.advanceTimersToNextTimer()
      expect(onTick).toHaveBeenCalledTimes(2)

      vi.advanceTimersToNextTimer()
      expect(onTick).toHaveBeenCalledTimes(3)
    })

    it('should decrement remaining time on each tick', () => {
      const onTick = vi.fn()
      const timer = new Timer({ duration: 5000, onTick, interval: 1000 })

      timer.start()

      vi.advanceTimersToNextTimer()
      const firstCall = onTick.mock.calls[0][0]
      expect(firstCall).toBeLessThanOrEqual(5000)

      vi.advanceTimersToNextTimer()
      const secondCall = onTick.mock.calls[1][0]
      expect(secondCall).toBeLessThan(firstCall)
    })

    it('should provide tick count to onTick callback', () => {
      const onTick = vi.fn()
      const timer = new Timer({ duration: 5000, onTick, interval: 1000 })

      timer.start()

      vi.advanceTimersToNextTimer()
      expect(onTick.mock.calls[0][1]).toBe(1)

      vi.advanceTimersToNextTimer()
      expect(onTick.mock.calls[1][1]).toBe(2)

      vi.advanceTimersToNextTimer()
      expect(onTick.mock.calls[2][1]).toBe(3)
    })

    it('should call onComplete when timer finishes', () => {
      const onComplete = vi.fn()
      const timer = new Timer({ duration: 3000, onComplete, interval: 1000 })

      timer.start()

      vi.advanceTimersToNextTimer()
      expect(onComplete).not.toHaveBeenCalled()

      vi.advanceTimersToNextTimer()
      expect(onComplete).not.toHaveBeenCalled()

      vi.advanceTimersToNextTimer()
      expect(onComplete).toHaveBeenCalledWith(0)
    })

    it('should complete with remaining time of 0', () => {
      const onTick = vi.fn()
      const onComplete = vi.fn()
      const timer = new Timer({
        duration: 2000,
        onTick,
        onComplete,
        interval: 1000,
      })

      timer.start()
      vi.runAllTimers()

      expect(onComplete).toHaveBeenCalledWith(0)
    })
  })

  describe('stop', () => {
    it('should stop the timer', () => {
      const onTick = vi.fn()
      const onStop = vi.fn()
      const timer = new Timer({ duration: 5000, onTick, onStop, interval: 1000 })

      timer.start()
      vi.advanceTimersToNextTimer()

      timer.stop()

      const callCountBeforeStop = onTick.mock.calls.length
      vi.advanceTimersToNextTimer()

      expect(onTick.mock.calls.length).toBe(callCountBeforeStop)
    })

    it('should call onStop callback', () => {
      const onStop = vi.fn()
      const timer = new Timer({ duration: 5000, onStop })

      timer.start()
      timer.stop()

      expect(onStop).toHaveBeenCalledWith(5000)
    })

    it('should reset remaining time to duration', () => {
      const timer = new Timer({ duration: 5000 })

      timer.start()
      vi.advanceTimersToNextTimer()

      expect(timer.formatRemainingTime()).not.toBe('0:05')

      timer.stop()

      expect(timer.formatRemainingTime()).toBe('0:05')
    })
  })

  describe('pause and resume', () => {
    it('should pause the timer and save remaining time', () => {
      const onTick = vi.fn()
      const timer = new Timer({ duration: 5000, onTick, interval: 1000 })

      timer.start()
      vi.advanceTimersToNextTimer()
      vi.advanceTimersToNextTimer()

      timer.pause()

      const callCountBeforePause = onTick.mock.calls.length
      vi.advanceTimersToNextTimer()

      expect(onTick.mock.calls.length).toBe(callCountBeforePause)
    })

    it('should resume the timer from paused state', () => {
      const onTick = vi.fn()
      const timer = new Timer({ duration: 5000, onTick, interval: 1000 })

      timer.start()
      vi.advanceTimersToNextTimer()
      vi.advanceTimersToNextTimer()

      timer.pause()

      const callCountBeforePause = onTick.mock.calls.length
      timer.resume()

      vi.advanceTimersToNextTimer()

      expect(onTick.mock.calls.length).toBeGreaterThan(callCountBeforePause)
    })
  })

  describe('reset', () => {
    it('should reset to original duration', () => {
      const timer = new Timer({ duration: 5000 })

      timer.start()
      vi.advanceTimersToNextTimer()

      expect(timer.formatRemainingTime()).not.toBe('0:05')

      timer.reset()

      expect(timer.formatRemainingTime()).toBe('0:05')
    })

    it('should reset to new duration if provided', () => {
      const timer = new Timer({ duration: 5000 })

      timer.start()
      vi.advanceTimersToNextTimer()

      timer.reset(10000)

      expect(timer.formatRemainingTime()).toBe('0:10')
    })

    it('should stop the timer when resetting', () => {
      const onTick = vi.fn()
      const timer = new Timer({ duration: 5000, onTick, interval: 1000 })

      timer.start()
      vi.advanceTimersToNextTimer()

      const callCountBeforeReset = onTick.mock.calls.length
      timer.reset()

      vi.advanceTimersToNextTimer()

      expect(onTick.mock.calls.length).toBe(callCountBeforeReset)
    })
  })

  describe('setDuration', () => {
    it('should change the duration and stop the timer', () => {
      const timer = new Timer({ duration: 5000 })

      timer.start()
      vi.advanceTimersToNextTimer()

      timer.setDuration(10000)

      expect(timer.formatRemainingTime()).toBe('0:10')
    })

    it('should stop the timer when changing duration', () => {
      const onTick = vi.fn()
      const timer = new Timer({ duration: 5000, onTick, interval: 1000 })

      timer.start()
      vi.advanceTimersToNextTimer()

      const callCountBeforeChange = onTick.mock.calls.length
      timer.setDuration(10000)

      vi.advanceTimersToNextTimer()

      expect(onTick.mock.calls.length).toBe(callCountBeforeChange)
    })
  })

  describe('on method', () => {
    it('should register onStart callback', () => {
      const onStart = vi.fn()
      const timer = new Timer({ duration: 5000 })

      timer.on('start', onStart)
      timer.start()

      expect(onStart).toHaveBeenCalledWith(5000)
    })

    it('should register onTick callback', () => {
      const onTick = vi.fn()
      const timer = new Timer({ duration: 5000, interval: 1000 })

      timer.on('tick', onTick)
      timer.start()

      vi.advanceTimersToNextTimer()

      expect(onTick).toHaveBeenCalled()
    })

    it('should register onStop callback', () => {
      const onStop = vi.fn()
      const timer = new Timer({ duration: 5000 })

      timer.on('stop', onStop)
      timer.start()
      timer.stop()

      expect(onStop).toHaveBeenCalledWith(5000)
    })

    it('should register onComplete callback', () => {
      const onComplete = vi.fn()
      const timer = new Timer({ duration: 2000, interval: 1000 })

      timer.on('complete', onComplete)
      timer.start()

      vi.runAllTimers()

      expect(onComplete).toHaveBeenCalledWith(0)
    })

    it('should override previously registered callbacks', () => {
      const onStart1 = vi.fn()
      const onStart2 = vi.fn()
      const timer = new Timer({ duration: 5000 })

      timer.on('start', onStart1)
      timer.on('start', onStart2)
      timer.start()

      expect(onStart1).not.toHaveBeenCalled()
      expect(onStart2).toHaveBeenCalledWith(5000)
    })
  })

  describe('formatting methods', () => {
    describe('formatRemainingTime (instance method)', () => {
      it('should format remaining time correctly', () => {
        const timer = new Timer({ duration: 125000 })

        expect(timer.formatRemainingTime()).toBe('2:05')
      })

      it('should format less than a minute', () => {
        const timer = new Timer({ duration: 45000 })

        expect(timer.formatRemainingTime()).toBe('0:45')
      })

      it('should format zero time', () => {
        const timer = new Timer({ duration: 0 })

        expect(timer.formatRemainingTime()).toBe('0:00')
      })
    })

    describe('formatRemainingTime (static method)', () => {
      it('should format milliseconds to MM:SS format', () => {
        expect(Timer.formatRemainingTime(125000)).toBe('2:05')
        expect(Timer.formatRemainingTime(5000)).toBe('0:05')
        expect(Timer.formatRemainingTime(60000)).toBe('1:00')
        expect(Timer.formatRemainingTime(0)).toBe('0:00')
      })

      it('should round up seconds', () => {
        expect(Timer.formatRemainingTime(1500)).toBe('0:02')
        expect(Timer.formatRemainingTime(1)).toBe('0:01')
      })
    })

    describe('formatRemainingMinutes', () => {
      it('should format remaining time in minutes', () => {
        const timer = new Timer({ duration: 125000 })

        expect(timer.formatRemainingMinutes()).toBe('3m')
      })

      it('should round up to next minute', () => {
        const timer = new Timer({ duration: 125001 })

        expect(timer.formatRemainingMinutes()).toBe('3m')
      })

      it('should show 1 minute for small durations', () => {
        const timer = new Timer({ duration: 1000 })

        expect(timer.formatRemainingMinutes()).toBe('1m')
      })
    })

    describe('formatRemainingSeconds', () => {
      it('should format remaining time in seconds', () => {
        const timer = new Timer({ duration: 5000 })

        expect(timer.formatRemainingSeconds()).toBe('5s')
      })

      it('should round up to next second', () => {
        const timer = new Timer({ duration: 5001 })

        expect(timer.formatRemainingSeconds()).toBe('6s')
      })

      it('should show 1 second for sub-second durations', () => {
        const timer = new Timer({ duration: 1 })

        expect(timer.formatRemainingSeconds()).toBe('1s')
      })

      it('should handle large durations', () => {
        const timer = new Timer({ duration: 3600000 })

        expect(timer.formatRemainingSeconds()).toBe('3600s')
      })
    })
  })

  describe('self-adjusting timer accuracy', () => {
    it('should adjust for drift in timing', () => {
      const onTick = vi.fn()
      const timer = new Timer({
        duration: 10000,
        onTick,
        interval: 1000,
      })

      timer.start()

      vi.advanceTimersToNextTimer()
      const remainingTime1 = onTick.mock.calls[0][0]

      vi.advanceTimersToNextTimer()
      const remainingTime2 = onTick.mock.calls[1][0]

      // Verify that time has advanced consistently
      expect(remainingTime1 - remainingTime2).toBeGreaterThan(0)
    })

    it('should complete at the right time', () => {
      const onTick = vi.fn()
      const onComplete = vi.fn()
      const timer = new Timer({
        duration: 5000,
        onTick,
        onComplete,
        interval: 1000,
      })

      timer.start()

      // Run all timers
      vi.runAllTimers()

      expect(onComplete).toHaveBeenCalled()
      expect(onTick.mock.calls.length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle very small duration', () => {
      const onComplete = vi.fn()
      const timer = new Timer({ duration: 100, onComplete })

      timer.start()
      vi.runAllTimers()

      expect(onComplete).toHaveBeenCalledWith(0)
    })

    it('should handle very large duration', () => {
      const timer = new Timer({ duration: 86400000 }) // 1 day

      timer.start()

      expect(timer.formatRemainingTime()).toBeDefined()
      expect(timer.formatRemainingSeconds()).toBe('86400s')

      timer.stop()
    })

    it('should handle multiple stop calls', () => {
      const onStop = vi.fn()
      const timer = new Timer({ duration: 5000, onStop })

      timer.start()
      timer.stop()
      timer.stop()
      timer.stop()

      expect(onStop).toHaveBeenCalledTimes(3)
    })

    it('should allow starting after stopping', () => {
      const onTick = vi.fn()
      const timer = new Timer({ duration: 5000, onTick, interval: 1000 })

      timer.start()
      vi.advanceTimersToNextTimer()

      timer.stop()

      const callCountAfterStop = onTick.mock.calls.length

      timer.start()
      vi.advanceTimersToNextTimer()

      expect(onTick.mock.calls.length).toBeGreaterThan(callCountAfterStop)
    })
  })
})
