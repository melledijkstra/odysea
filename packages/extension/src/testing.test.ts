import { describe, expect, it } from 'vitest'
import { createWebExtensionMock } from './testing'

describe('createWebExtensionMock', () => {
  it('should create a browser mock with sensible defaults', async () => {
    const mock = createWebExtensionMock()

    expect(mock.runtime.id).toBe('test-mock-extension-id')
    expect(mock.runtime.getManifest()).toEqual({ version: '1.0.0' })
    expect(mock.identity.getRedirectURL('google')).toBe(
      'https://mock.redirect/google'
    )
    expect(mock.identity.getRedirectURL()).toBe('https://mock.redirect/')
    expect(await mock.storage.local.get('key')).toEqual({})
    expect(await mock.tabs.query({})).toEqual([])
    expect(mock.runtime.onMessage.hasListener(() => {})).toBe(false)
  })

  it('should support custom extensionId and manifestVersion options', () => {
    const mock = createWebExtensionMock({
      extensionId: 'custom-ext-id',
      manifestVersion: '2.5.0',
    })

    expect(mock.runtime.id).toBe('custom-ext-id')
    expect(mock.runtime.getManifest()).toEqual({ version: '2.5.0' })
  })

  it('should return isolated mock instances per call', () => {
    const mockA = createWebExtensionMock()
    const mockB = createWebExtensionMock()

    mockA.runtime.sendMessage('hello')

    expect(mockA.runtime.sendMessage).toHaveBeenCalledTimes(1)
    expect(mockB.runtime.sendMessage).not.toHaveBeenCalled()
  })
})
