import * as browser from 'webextension-polyfill'

export const isHomepageUrl = (url: string) =>
  url.startsWith(`chrome-extension://${browser.runtime.id}/index.html`)
  || url.startsWith('chrome://newtab')
