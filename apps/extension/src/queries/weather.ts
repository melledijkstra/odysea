import {
  WeatherClient as BaseWeatherClient,
  type CurrentWeather,
  type DailyForecastItem,
  type HourlyForecastItem,
} from '@melledijkstra/api'
import { settingsStore } from '@/settings/index.svelte'
import { createQuery } from '@tanstack/svelte-query'
import type { usePositionQuery } from './position'

function createWeatherClient() {
  return new BaseWeatherClient(() => settingsStore.apiKeys.weather || '')
}

export function useWeatherQuery(
  positionQuery: ReturnType<typeof usePositionQuery>
) {
  return createQuery(() => ({
    queryKey: ['weather', 'current', positionQuery?.data],
    queryFn: async (): Promise<CurrentWeather | null> => {
      const position = positionQuery?.data
      if (!position) return null

      const info = await createWeatherClient().getCurrentWeather({
        lat: position.lat,
        lon: position.lon,
      })
      return info ?? null
    },
    enabled: Boolean(positionQuery?.data && settingsStore.apiKeys.weather),
    staleTime: 10 * 60 * 1000, // 10 minutes
  }))
}

export function useLocationNameQuery(
  positionQuery: ReturnType<typeof usePositionQuery>
) {
  return createQuery(() => ({
    queryKey: ['weather', 'location-name', positionQuery?.data],
    queryFn: async (): Promise<string | null> => {
      const position = positionQuery?.data
      if (!position) return null
      if (position.locationInfo?.city) return position.locationInfo.city

      const name = await createWeatherClient().getLocationName({
        lat: position.lat,
        lon: position.lon,
      })
      return name ?? null
    },
    enabled: Boolean(
      positionQuery?.data &&
      (positionQuery.data.locationInfo?.city || settingsStore.apiKeys.weather)
    ),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  }))
}

export function useHourlyForecastQuery(
  positionQuery: ReturnType<typeof usePositionQuery>,
  enabled: () => boolean
) {
  return createQuery(() => ({
    queryKey: ['weather', 'hourly', positionQuery?.data],
    queryFn: async (): Promise<HourlyForecastItem[] | null> => {
      const position = positionQuery?.data
      if (!position) return null

      const data = await createWeatherClient().getHourlyForecast({
        lat: position.lat,
        lon: position.lon,
      })
      return data ?? null
    },
    enabled:
      Boolean(positionQuery?.data && settingsStore.apiKeys.weather) &&
      enabled(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  }))
}

export function useDailyForecastQuery(
  positionQuery: ReturnType<typeof usePositionQuery>,
  enabled: () => boolean
) {
  return createQuery(() => ({
    queryKey: ['weather', 'daily', positionQuery?.data],
    queryFn: async (): Promise<DailyForecastItem[] | null> => {
      const position = positionQuery?.data
      if (!position) return null

      const data = await createWeatherClient().getDailyForecast({
        lat: position.lat,
        lon: position.lon,
      })
      return data ?? null
    },
    enabled:
      Boolean(positionQuery?.data && settingsStore.apiKeys.weather) &&
      enabled(),
    staleTime: 60 * 60 * 1000, // 1 hour
  }))
}
