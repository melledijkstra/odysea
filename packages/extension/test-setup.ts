const identityMock = {
  getRedirectURL: vi.fn(),
  getAuthToken: vi.fn(),
}

// without chrome.runtime.id webextension-polyfill won't work
const chromeObject = {
  runtime: { id: 'some-test-id' },
  identity: identityMock,
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
globalThis.chrome = chromeObject

const storageMock = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
}

vi.mock('webextension-polyfill', () => ({
  runtime: chromeObject.runtime,
  identity: chromeObject.identity,
  storage: {
    local: storageMock,
    sync: storageMock,
  },
}))
