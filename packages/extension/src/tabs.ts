import browser from 'webextension-polyfill'
import { isHomepageUrl } from './navigation'

export async function findExtensionTab(): Promise<
  browser.Tabs.Tab | undefined
> {
  const tabs = await browser.tabs.query({})
  return tabs.find((tab) => (tab.url ? isHomepageUrl(tab.url) : false))
}

export async function getActiveTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  return tabs[0]
}
