import { Logger } from '@melledijkstra/toolbox'
import { getCurrentPosition } from './geolocation'
import type { WeatherResponse } from '../definitions/openweathermap'
import { ApiKeyBaseClient } from '../keybaseclient'

export type WeatherInfo = {
  location: string
  temperature: number
  icon: string
}

export type GeoPosition = {
  lat: number
  lon: number
}

const logger = new Logger('weather')

const BASE_URL = 'https://api.openweathermap.org/data/2.5'

export class WeatherClient extends ApiKeyBaseClient {
  protected urlQueryKeyName: string = 'appid'

  constructor() {
    super(BASE_URL, process.env.VITE_WEATHER_API_KEY)
  }

  async getWeather(position?: GeoPosition): Promise<WeatherInfo | undefined> {
    let lat = position?.lat
    let lon = position?.lon

    if (!position) {
      const pos = await getCurrentPosition()
      lat = pos?.[0]
      lon = pos?.[1]
    }

    const response = await this.request<WeatherResponse>(
      `/weather?lat=${lat}&lon=${lon}&appid=${this.getApiKey()}`,
    )

    if (response) {
      logger.log('retrieved weather data from API, storing in cache')
      const info: WeatherInfo = {
        location: response.name,
        temperature: response.main.temp,
        icon: response.weather[0].icon,
      }
      return info
    }
  }
}
