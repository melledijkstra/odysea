import { vi } from 'vitest'

export const browser = {
  runtime: {
    id: 'test-mock-extension-id',
    sendMessage: vi.fn(),
    getManifest: vi.fn(() => ({ version: '1.0.0' })),
  },
  storage: {
    local: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
    },
    sync: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
    },
  },
  tabs: {
    query: vi.fn(() => Promise.resolve([])),
  },
  // add more mocks as needed
}

export default browser
