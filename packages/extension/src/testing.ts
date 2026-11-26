import { vi, type Mock } from 'vitest'

export interface WebExtensionMockOptions {
  extensionId?: string
  manifestVersion?: string
}

export interface StorageAreaMock {
  get: Mock
  set: Mock
  remove: Mock
  clear: Mock
}

export interface EventMock {
  addListener: Mock
  removeListener: Mock
  hasListener: Mock
}

export interface WebExtensionMock {
  runtime: {
    id: string
    sendMessage: Mock
    getManifest: Mock
    onMessage: EventMock
  }
  storage: {
    local: StorageAreaMock
    sync: StorageAreaMock
    onChanged: EventMock
  }
  identity: {
    getRedirectURL: Mock
    launchWebAuthFlow: Mock
  }
  tabs: {
    query: Mock
    create: Mock
    update: Mock
    remove: Mock
  }
}

function createStorageAreaMock(): StorageAreaMock {
  return {
    get: vi.fn(() => Promise.resolve({})),
    set: vi.fn(() => Promise.resolve()),
    remove: vi.fn(() => Promise.resolve()),
    clear: vi.fn(() => Promise.resolve()),
  }
}

function createEventMock(): EventMock {
  return {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(() => false),
  }
}

/**
 * Creates a reusable Vitest mock object compatible with `webextension-polyfill`.
 */
export function createWebExtensionMock(
  options: WebExtensionMockOptions = {}
): WebExtensionMock {
  const { extensionId = 'test-mock-extension-id', manifestVersion = '1.0.0' } =
    options

  return {
    runtime: {
      id: extensionId,
      sendMessage: vi.fn(),
      getManifest: vi.fn(() => ({ version: manifestVersion })),
      onMessage: createEventMock(),
    },
    storage: {
      local: createStorageAreaMock(),
      sync: createStorageAreaMock(),
      onChanged: createEventMock(),
    },
    identity: {
      getRedirectURL: vi.fn(
        (path?: string) => `https://mock.redirect/${path || ''}`
      ),
      launchWebAuthFlow: vi.fn(),
    },
    tabs: {
      query: vi.fn(() => Promise.resolve([])),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
  }
}
