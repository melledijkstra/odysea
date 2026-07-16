import { describe, it, expect, vi } from 'vitest'
import { retrieveUsername, storeUsername } from './browser'
import browser from 'webextension-polyfill'
import { NAME_STORAGE_KEY } from './constants'

const fakeStorage = vi.mocked(browser.storage.sync)

describe('ui.ts', () => {
  describe('retrieveUsername', () => {
    it('should retrieve the username from storage', async () => {
      const mockName = 'John Doe'
      fakeStorage.get.mockResolvedValue({ [NAME_STORAGE_KEY]: mockName })

      const result = await retrieveUsername()

      expect(fakeStorage.get).toHaveBeenCalledWith(NAME_STORAGE_KEY)
      expect(result).toBe(mockName)
    })
  })

  describe('storeUsername', () => {
    it('should store the username in storage', async () => {
      const mockName = 'Jane Doe'

      await storeUsername(mockName)

      expect(fakeStorage.set).toHaveBeenCalledWith({ [NAME_STORAGE_KEY]: mockName })
    })
  })
})
