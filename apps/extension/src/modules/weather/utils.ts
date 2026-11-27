import {
  mdiWeatherSunny,
  mdiWeatherPartlyCloudy,
  mdiWeatherCloudy,
  mdiWeatherRainy,
  mdiWeatherPartlyRainy,
  mdiWeatherLightning,
  mdiSnowflake,
  mdiWeatherFog,
  mdiCloudQuestionOutline,
  mdiWeatherNight,
  mdiWeatherNightPartlyCloudy,
} from '@mdi/js'
import type {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
} from '@melledijkstra/api'
import {
  kelvinToCelsius,
  mpsToKmh,
  uvIndexLevel,
  windDegToCompass,
} from '@melledijkstra/toolbox'
import type { DailyWeather, HourlyWeather, WeatherDetails } from './types'

export function weatherToMdiIcon(icon?: string) {
  switch (icon) {
    case '01d':
      return mdiWeatherSunny
    case '01n':
      return mdiWeatherNight
    case '02d':
      return mdiWeatherPartlyCloudy
    case '02n':
      return mdiWeatherNightPartlyCloudy
    case '03d':
    case '04d':
      return mdiWeatherCloudy
    case '03n':
    case '04n':
      return mdiWeatherNight
    case '09d':
    case '09n':
      return mdiWeatherRainy
    case '10d':
    case '10n':
      return mdiWeatherPartlyRainy
    case '11d':
    case '11n':
      return mdiWeatherLightning
    case '13d':
    case '13n':
      return mdiSnowflake
    case '50d':
    case '50n':
      return mdiWeatherFog
    default:
      return mdiCloudQuestionOutline
  }
}

function toShiftedDate(unixSeconds: number, timezoneOffsetSeconds: number) {
  return new Date((unixSeconds + timezoneOffsetSeconds) * 1000)
}

export function formatTime(
  unixSeconds: number,
  timezoneOffsetSeconds = 0
): string {
  const date = toShiftedDate(unixSeconds, timezoneOffsetSeconds)
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatHour(
  unixSeconds: number,
  timezoneOffsetSeconds = 0
): string {
  const date = toShiftedDate(unixSeconds, timezoneOffsetSeconds)
  return `${String(date.getUTCHours()).padStart(2, '0')}:00`
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function formatDayName(
  unixSeconds: number,
  timezoneOffsetSeconds = 0,
  index = 0
): string {
  if (index === 0) return 'Today'
  const date = toShiftedDate(unixSeconds, timezoneOffsetSeconds)
  return WEEKDAY_SHORT[date.getUTCDay()]
}

export function formatRelativeUpdatedAt(
  updatedAtMs: number | undefined,
  nowMs: number = Date.now()
): string {
  if (!updatedAtMs) return ''
  const diffMinutes = Math.max(0, Math.floor((nowMs - updatedAtMs) / 60_000))
  if (diffMinutes < 1) return 'Updated just now'
  if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  return `Updated ${diffHours}h ago`
}

export function computeTempRangeBar(
  low: number,
  high: number,
  overallMin: number,
  overallMax: number
): { leftPercent: number; widthPercent: number } {
  const span = overallMax - overallMin
  if (span <= 0) {
    return { leftPercent: 0, widthPercent: 100 }
  }
  const leftPercent = Math.max(
    0,
    Math.min(100, ((low - overallMin) / span) * 100)
  )
  const rightPercent = Math.max(
    leftPercent,
    Math.min(100, ((high - overallMin) / span) * 100)
  )
  const widthPercent = Math.max(6, rightPercent - leftPercent)
  return {
    leftPercent: Math.min(leftPercent, 100 - widthPercent),
    widthPercent,
  }
}

export function computeTempMarkerPercent(
  value: number,
  overallMin: number,
  overallMax: number
): number {
  const span = overallMax - overallMin
  if (span <= 0) return 50
  return Math.max(0, Math.min(100, ((value - overallMin) / span) * 100))
}

export function mapCurrentWeather(
  current: CurrentWeather,
  todayDaily?: DailyForecastItem
): WeatherDetails {
  const offset = current.timezoneOffset
  return {
    iconId: current.icon,
    temperatureC: kelvinToCelsius(current.temperature),
    feelsLikeC: kelvinToCelsius(current.feelsLike),
    description: current.description,
    highC: todayDaily ? kelvinToCelsius(todayDaily.tempMax) : undefined,
    lowC: todayDaily ? kelvinToCelsius(todayDaily.tempMin) : undefined,
    windKmh: mpsToKmh(current.windSpeed),
    windGustKmh:
      current.windGust !== undefined ? mpsToKmh(current.windGust) : undefined,
    windCompass: windDegToCompass(current.windDeg),
    windDeg: Math.round(current.windDeg),
    humidity: current.humidity,
    uvi: Math.round(current.uvi * 10) / 10,
    uviLevel: uvIndexLevel(current.uvi),
    sunriseTime:
      current.sunrise !== undefined
        ? formatTime(current.sunrise, offset)
        : undefined,
    sunsetTime:
      current.sunset !== undefined
        ? formatTime(current.sunset, offset)
        : undefined,
    visibilityKm: Math.round((current.visibility / 1000) * 10) / 10,
    pressureHpa: current.pressure,
  }
}

export function mapHourlyWeather(
  items: HourlyForecastItem[],
  timezoneOffsetSeconds: number
): HourlyWeather[] {
  return items.map((item, idx) => ({
    id: item.dt,
    label: idx === 0 ? 'Now' : formatHour(item.dt, timezoneOffsetSeconds),
    iconId: item.icon,
    temperatureC: kelvinToCelsius(item.temperature),
    precipChance: Math.round(item.pop * 100),
  }))
}

export function mapDailyWeather(
  items: DailyForecastItem[],
  timezoneOffsetSeconds: number
): DailyWeather[] {
  return items.map((item, idx) => ({
    id: item.dt,
    label: formatDayName(item.dt, timezoneOffsetSeconds, idx),
    iconId: item.icon,
    description: item.description,
    lowC: kelvinToCelsius(item.tempMin),
    highC: kelvinToCelsius(item.tempMax),
    precipChance: Math.round(item.pop * 100),
  }))
}
