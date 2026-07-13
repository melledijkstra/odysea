import { MockInstance } from 'vitest'
import { Logger } from './logger'

describe('Logger', () => {
  let logger: Logger
  let consoleLogSpy: MockInstance
  let consoleErrorSpy: MockInstance
  let consoleWarnSpy: MockInstance

  beforeEach(() => {
    logger = new Logger('TestLogger', false)
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a logger instance with a given name', () => {
    expect(logger.name).toBe('TestLogger')
    expect(logger.disabled).toBe(false)
  })

  it('should create a disabled logger instance', () => {
    const disabledLogger = new Logger('DisabledLogger', true)
    expect(disabledLogger.disabled).toBe(true)
  })

  describe('log method', () => {
    it('should log messages with the logger name prefix', () => {
      logger.log('Hello', 'World')
      expect(consoleLogSpy).toHaveBeenCalledWith('[TestLogger]', 'Hello', 'World')
    })

    it('should not log if the logger is disabled', () => {
      logger.disabled = true
      logger.log('Hello', 'World')
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('error method', () => {
    it('should log errors with the logger name prefix', () => {
      logger.error('Error occurred')
      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestLogger]', 'Error occurred')
    })

    it('should not log errors if the logger is disabled', () => {
      logger.disabled = true
      logger.error('Error occurred')
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('warn method', () => {
    it('should log warnings with the logger name prefix', () => {
      logger.warn('Warning occurred')
      expect(consoleWarnSpy).toHaveBeenCalledWith('[TestLogger]', 'Warning occurred')
    })

    it('should not log warnings if the logger is disabled', () => {
      logger.disabled = true
      logger.warn('Warning occurred')
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })
  })

  describe('time and timeEnd methods', () => {
    let consoleTimeSpy: ReturnType<typeof vi.spyOn>
    let consoleTimeEndSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleTimeSpy = vi.spyOn(console, 'time').mockImplementation(() => {})
      consoleTimeEndSpy = vi.spyOn(console, 'timeEnd').mockImplementation(() => {})
    })

    it('should start and end a timer with the logger name prefix', () => {
      logger.time('timer')
      expect(consoleTimeSpy).toHaveBeenCalledWith('[TestLogger] timer')

      logger.timeEnd('timer')
      expect(consoleTimeEndSpy).toHaveBeenCalledWith('[TestLogger] timer')
    })

    it('should not start or end a timer if the logger is disabled', () => {
      logger.disabled = true
      logger.time('timer')
      expect(consoleTimeSpy).not.toHaveBeenCalled()

      logger.timeEnd('timer')
      expect(consoleTimeEndSpy).not.toHaveBeenCalled()
    })
  })
})
