import { WeatherClient as BaseWeatherClient, getCurrentPosition, type WeatherInfo, type GeoPosition } from '@melledijkstra/api'
import { WebLocalStorage, MIN_10 } from '@melledijkstra/storage'
import { Logger } from '@/logger'
import { appState } from '@/app-state.svelte'

const logger = new Logger('weather')
const cache = new WebLocalStorage()

export class WeatherClient extends BaseWeatherClient {
  async getWeather(position?: GeoPosition): Promise<WeatherInfo | undefined> {
    const data = await cache.get<WeatherInfo>('weather')
    if (data) {
      logger.log('weather data from cache')
      return data
    }

    let lat: number
    let lon: number

    if (position) {
      lat = position.lat
      lon = position.lon
    }
    else {
      const pos = await getCurrentPosition()
      if (!pos) return

      lat = pos.lat
      lon = pos.lon
      if (pos.locationInfo) {
        appState.geolocation = pos.locationInfo
      }
    }

    const info = await super.getWeather({ lat, lon })

    if (info) {
      logger.log('retrieved weather data from API, storing in cache')
      await cache.set('weather', info, MIN_10)
      return info
    }
  }
}
