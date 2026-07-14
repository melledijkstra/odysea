import { test as base, chromium, type BrowserContext } from '@playwright/test'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const test = base.extend<{
  context: BrowserContext
  extensionId: string
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    // Path to the built extension
    const pathToExtension = path.join(__dirname, '../../dist')
    console.log('Loading extension from:', pathToExtension)
    const context = await chromium.launchPersistentContext('', {
      headless: false, // Must be headed for extensions in many cases
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    })
    console.log('Extension loaded, waiting for it to initialize...')
    await use(context)
    await context.close()
  },
  extensionId: async ({ context }, use) => {
    // for manifest v3:
    let [serviceWorker] = context.serviceWorkers()
    if (!serviceWorker)
      serviceWorker = await context.waitForEvent('serviceworker')

    const extensionId = new URL(serviceWorker.url()).hostname
    console.log('Extension initialized with ID:', extensionId)
    await use(extensionId)
  },
})
export const expect = test.expect
