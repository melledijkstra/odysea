import { getCurrentPosition } from './geolocation'
import type {
  OneCallCurrentRecord,
  OneCallDailyRecord,
  OneCallHourlyRecord,
  OneCallResponse,
  ReverseGeocodingResult,
} from '../definitions/openweathermap'
import { ApiKeyBaseClient } from '../keybaseclient'

export type CurrentWeather = {
  dt: number
  timezone: string
  timezoneOffset: number
  temperature: number
  feelsLike: number
  description: string
  icon: string
  humidity: number
  pressure: number
  uvi: number
  visibility: number
  clouds: number
  dewPoint: number
  windSpeed: number
  windGust?: number
  windDeg: number
  sunrise?: number
  sunset?: number
  rain1h?: number
  snow1h?: number
}

export type HourlyForecastItem = {
  dt: number
  temperature: number
  feelsLike: number
  icon: string
  description: string
  pop: number
  rain1h?: number
  snow1h?: number
}

export type DailyForecastItem = {
  dt: number
  tempMin: number
  tempMax: number
  tempDay: number
  icon: string
  description: string
  pop: number
  uvi: number
  humidity: number
  windSpeed: number
  sunrise?: number
  sunset?: number
}

export type GeoPosition = {
  lat: number
  lon: number
}

const BASE_URL = 'https://api.openweathermap.org'

export class WeatherClient extends ApiKeyBaseClient {
  protected urlQueryKeyName: string = 'appid'

  constructor(apiKey?: string | (() => string)) {
    const key =
      apiKey ??
      (typeof process !== 'undefined'
        ? process.env.VITE_WEATHER_API_KEY
        : undefined)
    super(BASE_URL, key)
  }

  private async resolvePosition(
    position?: GeoPosition
  ): Promise<GeoPosition | undefined> {
    if (position) return position
    const pos = await getCurrentPosition()
    if (!pos) return undefined
    return { lat: pos.lat, lon: pos.lon }
  }

  async getCurrentWeather(
    position?: GeoPosition
  ): Promise<CurrentWeather | undefined> {
    const pos = await this.resolvePosition(position)
    if (!pos) return undefined

    const response = await this.request<OneCallResponse<OneCallCurrentRecord>>(
      `/data/4.0/onecall/current?lat=${pos.lat}&lon=${pos.lon}`
    )

    const current = response?.data?.[0]
    if (!response || !current) return undefined

    const condition = current.weather[0]
    return {
      dt: current.dt,
      timezone: response.timezone,
      timezoneOffset: response.timezone_offset,
      temperature: current.temp,
      feelsLike: current.feels_like,
      description: condition?.description ?? '',
      icon: condition?.icon ?? '',
      humidity: current.humidity,
      pressure: current.pressure,
      uvi: current.uvi,
      visibility: current.visibility,
      clouds: current.clouds,
      dewPoint: current.dew_point,
      windSpeed: current.wind_speed,
      windGust: current.wind_gust,
      windDeg: current.wind_deg,
      sunrise: current.sunrise,
      sunset: current.sunset,
      rain1h: current.rain?.['1h'],
      snow1h: current.snow?.['1h'],
    }
  }

  async getHourlyForecast(
    position: GeoPosition
  ): Promise<HourlyForecastItem[] | undefined> {
    const response = await this.request<OneCallResponse<OneCallHourlyRecord>>(
      `/data/4.0/onecall/timeline/1h?lat=${position.lat}&lon=${position.lon}`
    )

    if (!response?.data) return undefined

    return response.data.map((item) => {
      const condition = item.weather[0]
      return {
        dt: item.dt,
        temperature: item.temp,
        feelsLike: item.feels_like,
        icon: condition?.icon ?? '',
        description: condition?.description ?? '',
        pop: item.pop,
        rain1h: item.rain?.['1h'],
        snow1h: item.snow?.['1h'],
      }
    })
  }

  async getDailyForecast(
    position: GeoPosition
  ): Promise<DailyForecastItem[] | undefined> {
    const response = await this.request<OneCallResponse<OneCallDailyRecord>>(
      `/data/4.0/onecall/timeline/1day?lat=${position.lat}&lon=${position.lon}`
    )

    if (!response?.data) return undefined

    return response.data.map((item) => {
      const condition = item.weather[0]
      return {
        dt: item.dt,
        tempMin: item.temp.min,
        tempMax: item.temp.max,
        tempDay: item.temp.day,
        icon: condition?.icon ?? '',
        description: condition?.description ?? '',
        pop: item.pop,
        uvi: item.uvi,
        humidity: item.humidity,
        windSpeed: item.wind_speed,
        sunrise: item.sunrise,
        sunset: item.sunset,
      }
    })
  }

  async getLocationName(position: GeoPosition): Promise<string | undefined> {
    const response = await this.request<ReverseGeocodingResult[]>(
      `/geo/1.0/reverse?lat=${position.lat}&lon=${position.lon}&limit=1`
    )

    return response?.[0]?.name
  }
}
