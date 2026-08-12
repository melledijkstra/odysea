import {
  WeatherClient as BaseWeatherClient,
  getCurrentPosition,
  type WeatherInfo,
  type GeoPositionResponse,
} from '@melledijkstra/api'
import { appState } from '@/app-state.svelte'
import { settingsStore } from '@/settings/index.svelte'
import { createQuery } from '@tanstack/svelte-query'

export function usePositionQuery() {
  return createQuery<GeoPositionResponse | null>(() => ({
    queryKey: ['position'],
    retry: 1,
    queryFn: async () => {
      const pos = await getCurrentPosition()
      console.log('retrieved position', pos)
      if (pos?.locationInfo) {
        appState.geolocation = pos.locationInfo
        return pos
      }
      if (pos?.lat && pos?.lon) {
        return pos
      }
      throw new Error('Failed to get position')
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  }))
}

export function useWeatherQuery(
  positionQuery: ReturnType<typeof usePositionQuery>
) {
  return createQuery(() => ({
    queryKey: ['weather', positionQuery?.data],
    queryFn: async (): Promise<WeatherInfo | null> => {
      const position = positionQuery?.data
      if (!position) {
        return null
      }

      const client = new BaseWeatherClient(
        () => settingsStore.apiKeys.weather || ''
      )
      const info = await client.getWeather({
        lat: position.lat,
        lon: position.lon,
      })

      return info || null
    },
    enabled: Boolean(positionQuery?.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
  }))
}
