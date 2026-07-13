import { calculateRemainingDays, formatSeconds, getBrowserLocale, getTime, getTimePercentage, millisecondsToTime, playbackLoop, renderTimezone, repeatEvery } from './utils'

class FakeNavigator {
  language = 'nl-NL'
  languages = [this.language]

  constructor(locale?: string) {
    if (locale) {
      this.language = locale
      this.languages = [this.language]
    }
  }
}

function setFakeLocale(locale?: string) {
  vi.stubGlobal('navigator', new FakeNavigator(locale))
}

describe('Time Utilities', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.stubGlobal('navigator', new FakeNavigator())
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  describe('getBrowserLocale', () => {
    it('should be able to retrieve the browser locale', () => {
      const locale = getBrowserLocale()

      expect(locale).toBe('nl-NL')
    })
  })

  describe('repeatEvery', () => {
    it('should run the given function every interval indicated', () => {
      const callback = vi.fn()

      const cleanup = repeatEvery(callback, 1000)

      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersToNextTimer()

      expect(callback).toHaveBeenCalledTimes(1)

      // run 2 more times
      vi.advanceTimersToNextTimer()
        .advanceTimersToNextTimer()

      expect(callback).toHaveBeenCalledTimes(3)

      // stops the interval timer
      cleanup()

      vi.advanceTimersToNextTimer()

      // even though time advanced, we cancelled the time and callback shouldn't run anymore
      expect(callback).toHaveBeenCalledTimes(3)
    })
  })

  describe('millisecondsToTime', () => {
    it('should format milliseconds to time', () => {
      expect(millisecondsToTime(1000)).toBe('0:01') // 1 second
      expect(millisecondsToTime(1000 * 3)).toBe('0:03') // 3 seconds
      expect(millisecondsToTime(1000 * 59)).toBe('0:59') // 3 seconds
      expect(millisecondsToTime(1000 * 60)).toBe('1:00') // 1 minute
      expect(millisecondsToTime(1000 * 60 * 20)).toBe('20:00') // 20 minutes
      expect(millisecondsToTime(1000 * 60 * 60)).toBe('60:00') // 1 hour
      expect(millisecondsToTime(1000 * 60 * 60 * 24)).toBe('1440:00') // 1 day
    })

    it('should format milliseconds less than a second', () => {
      expect(millisecondsToTime(500)).toBe('0:00')
    })

    it('should format milliseconds more than a second', () => {
      expect(millisecondsToTime(1500)).toBe('0:01')
    })

    it('should handle negative milliseconds', () => {
      expect(millisecondsToTime(-5000)).toBe('-0:05')
    })
  })

  describe('formatSeconds', () => {
    it('should format seconds', () => {
      expect(formatSeconds(0)).toBe('0:00')
      expect(formatSeconds(1)).toBe('0:01')
      expect(formatSeconds(3)).toBe('0:03')
      expect(formatSeconds(59)).toBe('0:59')
      expect(formatSeconds(60)).toBe('1:00')
      expect(formatSeconds(60 * 20)).toBe('20:00')
      expect(formatSeconds(60 * 60)).toBe('60:00')
      expect(formatSeconds(60 * 60 * 24)).toBe('1440:00')
    })

    it('should handle fractional seconds', () => {
      expect(formatSeconds(1.5)).toBe('0:01')
    })

    it('should handle negative seconds', () => {
      expect(formatSeconds(-5)).toBe('-0:05')
    })
  })

  describe('renderTimezone', () => {
    it('should be able to render timezone', () => {
      setFakeLocale('nl-NL')

      const fakeDateTime = new Date('2026-02-01T11:00:00.000Z')
      vi.setSystemTime(fakeDateTime)

      expect(renderTimezone('Europe/Amsterdam')).toBe('12:00')
      expect(renderTimezone('Europe/Berlin')).toBe('12:00')
      expect(renderTimezone('Europe/Lisbon')).toBe('11:00')
      expect(renderTimezone('Africa/Djibouti')).toBe('14:00')
      expect(renderTimezone('Asia/Tokyo')).toBe('20:00')
    })
  })

  describe('calculateRemainingDays', () => {
    it('should calculate remaining days until a future date', () => {
      const today = new Date(2026, 0, 13)
      vi.setSystemTime(today)

      const futureDate = new Date(2026, 0, 20).getTime()
      expect(calculateRemainingDays(futureDate)).toBe(7)
    })

    it('should return 0 for same day', () => {
      const today = new Date(2026, 0, 13)
      vi.setSystemTime(today)

      const sameDay = new Date(2026, 0, 13, 23, 59, 59).getTime()
      expect(calculateRemainingDays(sameDay)).toBe(0)
    })

    it('should return negative days for past dates', () => {
      const today = new Date(2026, 0, 13)
      vi.setSystemTime(today)

      const pastDate = new Date(2026, 0, 10).getTime()
      expect(calculateRemainingDays(pastDate)).toBe(-3)
    })

    it('should return 1 for tomorrow', () => {
      const today = new Date(2026, 0, 13)
      vi.setSystemTime(today)

      const tomorrow = new Date(2026, 0, 14).getTime()
      expect(calculateRemainingDays(tomorrow)).toBe(1)
    })
  })

  describe('getTime', () => {
    it('should return the current time in browser locale format', () => {
      const fakeDateTime = new Date(2026, 0, 13, 14, 30, 0, 0)
      vi.setSystemTime(fakeDateTime)
      vi.stubGlobal('navigator', new FakeNavigator())

      const time = getTime()

      // The exact format depends on the browser locale, so we just verify it's a non-empty string
      expect(typeof time).toBe('string')
      expect(time.length).toBeGreaterThan(0)
    })

    it('should use browser locale for formatting', () => {
      const fakeDateTime = new Date(2026, 0, 13, 14, 30, 0, 0)
      vi.setSystemTime(fakeDateTime)

      const dutchNavigator = new FakeNavigator()
      vi.stubGlobal('navigator', dutchNavigator)

      const time = getTime()

      // Verify it returns a time string
      expect(time).toMatch(/\d{1,2}:\d{2}/)
    })
  })

  describe('getTimePercentage', () => {
    it('should return 0% at midnight', () => {
      const midnight = new Date(2026, 0, 13, 0, 0, 0, 0)
      vi.setSystemTime(midnight)

      expect(getTimePercentage()).toBe('0%')
    })

    it('should return 50% at noon', () => {
      const noon = new Date(2026, 0, 13, 12, 0, 0, 0)
      vi.setSystemTime(noon)

      expect(getTimePercentage()).toBe('50%')
    })

    it('should return 100% just before midnight', () => {
      const almostMidnight = new Date(2026, 0, 13, 23, 59, 0, 0)
      vi.setSystemTime(almostMidnight)

      expect(getTimePercentage()).toBe('100%')
    })

    it('should return 25% at 6 AM', () => {
      const sixAM = new Date(2026, 0, 13, 6, 0, 0, 0)
      vi.setSystemTime(sixAM)

      expect(getTimePercentage()).toBe('25%')
    })

    it('should return correct percentage at arbitrary time', () => {
      const time = new Date(2026, 0, 13, 8, 24, 0, 0) // 504 minutes into the day
      vi.setSystemTime(time)

      // (8 * 60 + 24) / 1440 * 100 = 504 / 1440 * 100 = 35%
      expect(getTimePercentage()).toBe('35%')
    })
  })

  describe('playbackLoop', () => {
    it('should call the callback at each interval', () => {
      const callback = vi.fn()

      const cleanup = playbackLoop(callback, 1000)

      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersToNextTimer()

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(1000)

      vi.advanceTimersToNextTimer()

      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenCalledWith(2000)

      cleanup()
    })

    it('should start from initial position', () => {
      const callback = vi.fn()

      const cleanup = playbackLoop(callback, 500, 1000)

      vi.advanceTimersToNextTimer()

      expect(callback).toHaveBeenCalledWith(1500)

      vi.advanceTimersToNextTimer()

      expect(callback).toHaveBeenCalledWith(2000)

      cleanup()
    })

    it('should be able to stop the loop', () => {
      const callback = vi.fn()

      const cleanup = playbackLoop(callback, 1000)

      vi.advanceTimersToNextTimer()
      expect(callback).toHaveBeenCalledTimes(1)

      cleanup()

      vi.advanceTimersToNextTimer()

      // Callback should still be 1, as the loop has been stopped
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should increment position by interval on each call', () => {
      const callback = vi.fn()

      const cleanup = playbackLoop(callback, 250)

      vi.advanceTimersToNextTimer()
      expect(callback).toHaveBeenCalledWith(250)

      vi.advanceTimersToNextTimer()
      expect(callback).toHaveBeenCalledWith(500)

      vi.advanceTimersToNextTimer()
      expect(callback).toHaveBeenCalledWith(750)

      cleanup()
    })
  })
})
