import type { MockInstance } from 'vitest'
import { Logger, type ILogger } from './logger'

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
    Logger.defaultDisabled = undefined
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
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
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[TestLogger]',
        'Hello',
        'World'
      )
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
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TestLogger]',
        'Error occurred'
      )
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
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[TestLogger]',
        'Warning occurred'
      )
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
      consoleTimeEndSpy = vi
        .spyOn(console, 'timeEnd')
        .mockImplementation(() => {})
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

  describe('debug method', () => {
    let consoleDebugSpy: MockInstance

    beforeEach(() => {
      consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    })

    it('should log debug messages with the logger name prefix', () => {
      logger.debug('Debug info', { ok: true })
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[TestLogger]',
        'Debug info',
        { ok: true }
      )
    })

    it('should not log debug messages if the logger is disabled', () => {
      logger.disabled = true
      logger.debug('Debug info')
      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })
  })

  describe('styled %c log formatting', () => {
    it('should prepend the logger name before %c format strings', () => {
      logger.log('%cHello', 'color: red')
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[TestLogger] %cHello',
        'color: red'
      )
    })
  })

  describe('defaultDisabled and environment precedence', () => {
    it('should disable new loggers when Logger.defaultDisabled is true even in development', () => {
      vi.stubEnv('NODE_ENV', 'development')
      Logger.defaultDisabled = true

      const instance = new Logger('DevLogger')
      expect(instance.disabled).toBe(true)
    })

    it('should enable new loggers when Logger.defaultDisabled is false even in test', () => {
      vi.stubEnv('NODE_ENV', 'test')
      Logger.defaultDisabled = false

      const instance = new Logger('TestOverrideLogger')
      expect(instance.disabled).toBe(false)
    })

    it('should let explicit constructor disabled arg override Logger.defaultDisabled', () => {
      Logger.defaultDisabled = true
      expect(new Logger('ExplicitEnabled', false).disabled).toBe(false)

      Logger.defaultDisabled = false
      expect(new Logger('ExplicitDisabled', true).disabled).toBe(true)
    })

    it('should fall back to NODE_ENV when disabled and defaultDisabled are undefined', () => {
      Logger.defaultDisabled = undefined

      vi.stubEnv('NODE_ENV', 'test')
      expect(new Logger('LowerTest').disabled).toBe(true)

      vi.stubEnv('NODE_ENV', 'TEST')
      expect(new Logger('UpperTest').disabled).toBe(true)

      vi.stubEnv('NODE_ENV', 'development')
      expect(new Logger('Dev').disabled).toBe(false)

      vi.stubEnv('NODE_ENV', 'production')
      expect(new Logger('Prod').disabled).toBe(false)
    })
  })

  describe('browser safety', () => {
    it('should not throw when process is undefined (browser environment)', () => {
      vi.stubGlobal('process', undefined)
      let browserLogger: Logger
      try {
        browserLogger = new Logger('BrowserLogger')
      } finally {
        vi.unstubAllGlobals()
      }
      expect(browserLogger.disabled).toBe(false)
    })

    it('should not throw when process.env is undefined', () => {
      vi.stubGlobal('process', {})
      let shimmedLogger: Logger
      try {
        shimmedLogger = new Logger('ShimmedLogger')
      } finally {
        vi.unstubAllGlobals()
      }
      expect(shimmedLogger.disabled).toBe(false)
    })
  })

  describe('ILogger interface', () => {
    it('should be satisfied by objects holding a Logger instance', () => {
      const holder: ILogger = { logger }
      expect(holder.logger).toBe(logger)
    })
  })
})
