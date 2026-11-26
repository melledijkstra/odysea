import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './error'

class CustomError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CustomError'
  }
}

describe('getErrorMessage', () => {
  it('should return the message for Error instances and subclasses', () => {
    expect(getErrorMessage(new Error('Something failed'))).toBe(
      'Something failed'
    )
    expect(getErrorMessage(new TypeError('bad arg'))).toBe('bad arg')
    expect(getErrorMessage(new CustomError('custom failure'))).toBe(
      'custom failure'
    )
    expect(getErrorMessage(new Error(''))).toBe('')
  })

  it('should stringify primitive values', () => {
    expect(getErrorMessage('plain string')).toBe('plain string')
    expect(getErrorMessage(404)).toBe('404')
    expect(getErrorMessage(false)).toBe('false')
    expect(getErrorMessage(null)).toBe('null')
    expect(getErrorMessage(undefined)).toBe('undefined')
    expect(getErrorMessage(Symbol('err'))).toBe('Symbol(err)')
  })

  it('should stringify plain objects', () => {
    expect(getErrorMessage({ code: 500 })).toBe('[object Object]')
  })

  it('should return "Unknown error" if string conversion throws', () => {
    const nullProto: unknown = Object.create(null)
    expect(getErrorMessage(nullProto)).toBe('Unknown error')

    const throwingObj = {
      toString() {
        throw new Error('cannot stringify')
      },
    }
    expect(getErrorMessage(throwingObj)).toBe('Unknown error')
  })
})
