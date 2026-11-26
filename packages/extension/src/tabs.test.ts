import { beforeEach, describe, expect, it, vi } from 'vitest'
import browser from 'webextension-polyfill'
import { findExtensionTab } from './tabs'

describe('findExtensionTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should find a tab matching the extension homepage URL', async () => {
    const extensionTab = {
      id: 2,
      url: `chrome-extension://${browser.runtime.id}/index.html`,
    } as browser.Tabs.Tab

    vi.mocked(browser.tabs.query).mockResolvedValueOnce([
      { id: 1, url: 'https://example.com' } as browser.Tabs.Tab,
      extensionTab,
    ])

    const result = await findExtensionTab()
    expect(result).toBe(extensionTab)
  })

  it('should find a chrome://newtab tab', async () => {
    const newtab = {
      id: 3,
      url: 'chrome://newtab/',
    } as browser.Tabs.Tab

    vi.mocked(browser.tabs.query).mockResolvedValueOnce([
      { id: 1, url: undefined } as browser.Tabs.Tab,
      newtab,
    ])

    const result = await findExtensionTab()
    expect(result).toBe(newtab)
  })
})
