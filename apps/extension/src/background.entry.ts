/// <reference lib="webworker" />
import browser from 'webextension-polyfill'
import { FocusService } from '@/services/focus'
import { Logger } from '@/logger'
import { trimCache } from './background/image-cache'

declare const self: ServiceWorkerGlobalScope

export const logger = new Logger('background')

declare global {
  function r(): void
}

const services = []

browser.runtime.onInstalled.addListener(({ reason }) => {
  logger.log('Extension installed:', reason)
  if (reason === 'install') {
    browser.notifications.create({
      type: 'basic',
      title: 'Thanks for installing!',
      message:
        'Welcome to a more productive homepage tailored just for you. Click here to open your new homepage!',
      iconUrl: browser.runtime.getURL('icons/hand-wave.png'),
    })
  }
})

browser.notifications.onClicked.addListener((notificationId) => {
  logger.log('Notification clicked:', notificationId)
  browser.tabs.create({ url: '/index.html' })
})

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  // clean up any stale entries right away
  e.waitUntil(trimCache())
})

logger.log('Service worker activated')
logger.log('Initializing services...')
services.push(
  new FocusService(),
)
logger.log(`Services initialized: ${services.map(s => s.constructor.name).join(', ')}`)

if (import.meta.env.DEV) {
  // add global r() function to make development easier reloading
  // the background script
  globalThis.r = () => {
    browser.runtime.reload()
  }
}
