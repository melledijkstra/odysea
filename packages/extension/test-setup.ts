import { vi } from 'vitest'
import { createWebExtensionMock } from './src/testing'

const mockBrowser = createWebExtensionMock({ extensionId: 'some-test-id' })

vi.stubGlobal('chrome', mockBrowser)
vi.stubGlobal('browser', mockBrowser)

vi.mock('webextension-polyfill', () => ({
  default: (globalThis as Record<string, unknown>).browser,
}))
