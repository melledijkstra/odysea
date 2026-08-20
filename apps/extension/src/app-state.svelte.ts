import type { LocationInfo, WeatherInfo, Account } from '@melledijkstra/api'
import { WebLocalStorage } from '@melledijkstra/storage'
import { ACCOUNT_CACHE_KEY } from './constants'

const STORAGE_KEY = 'appMode'

export const appModes = ['default', 'breathing', 'focus'] as const

export type AppMode = (typeof appModes)[number]

export type User = {
  name: string
}

export type AppState = {
  mode: AppMode
  account?: Account
  title: string
  weather?: WeatherInfo
  geolocation?: LocationInfo
}

const cache = new WebLocalStorage()

export const appState = $state<AppState>({
  mode: (localStorage.getItem(STORAGE_KEY) as AppMode) ?? 'default',
  account: await cache.get<Account>(ACCOUNT_CACHE_KEY),
  title: 'New Tab',
})

export function switchAppMode(mode: AppMode) {
  appState.mode = mode
  localStorage.setItem(STORAGE_KEY, mode)
  window.dispatchEvent(new CustomEvent('app:close-panels'))
}

export function setTitle(title: string) {
  appState.title = title
}

export function resetTitle() {
  appState.title = 'New Tab'
}
