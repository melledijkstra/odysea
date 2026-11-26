export type WeatherPanelCurrent = {
  iconId: string
  temperatureC: number
  feelsLikeC: number
  description: string
  highC?: number
  lowC?: number
  windKmh: number
  windGustKmh?: number
  windCompass: string
  windDeg: number
  humidity: number
  uvi: number
  uviLevel: string
  sunriseTime?: string
  sunsetTime?: string
  visibilityKm: number
  pressureHpa: number
}

export type WeatherPanelHourlyItem = {
  id: number
  label: string
  iconId: string
  temperatureC: number
  precipChance: number
}

export type WeatherPanelDailyItem = {
  id: number
  label: string
  iconId: string
  description: string
  lowC: number
  highC: number
  precipChance: number
}

export type WeatherPanelTab = 'today' | 'forecast'
