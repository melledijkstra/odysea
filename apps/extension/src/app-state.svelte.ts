import type { LocationInfo, WeatherInfo } from '@melledijkstra/api'

const STORAGE_KEY = 'appMode'

export const appModes = ['default', 'breathing', 'focus'] as const

export type AppMode = (typeof appModes)[number]

export type User = {
  name: string
}

export type AppState = {
  mode: AppMode
  user?: User
  title: string
  weather?: WeatherInfo
  geolocation?: LocationInfo
}

export const appState = $state<AppState>({
  mode: (localStorage.getItem(STORAGE_KEY) as AppMode) ?? 'default',
  title: 'New Tab',
})

// Trigger to let components know to close popovers/panels when home is clicked
export const homeClickTrigger = $state({ count: 0 })

export function switchAppMode(mode: AppMode) {
  appState.mode = mode
  localStorage.setItem(STORAGE_KEY, mode)
  if (mode === 'default') {
    homeClickTrigger.count++
  }
}

export function setTitle(title: string) {
  appState.title = title
}

export function resetTitle() {
  appState.title = 'New Tab'
}
