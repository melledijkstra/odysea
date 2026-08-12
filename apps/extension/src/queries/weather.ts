import {
  WeatherClient as BaseWeatherClient,
  type WeatherInfo,
} from '@melledijkstra/api'
import { settingsStore } from '@/settings/index.svelte'
import { createQuery } from '@tanstack/svelte-query'
import type { usePositionQuery } from './position'

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
