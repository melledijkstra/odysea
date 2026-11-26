export type OpenWeatherCondition = {
  id: number // 501
  main: string // 'Rain'
  description: string // 'moderate rain'
  icon: string // '10d'
}

export type PrecipitationVolume = {
  '1h': number // mm/h
}

export type OneCallCurrentRecord = {
  dt: number
  sunrise?: number
  sunset?: number
  temp: number
  feels_like: number
  pressure: number
  humidity: number
  dew_point: number
  uvi: number
  clouds: number
  visibility: number
  wind_speed: number
  wind_gust?: number
  wind_deg: number
  rain?: PrecipitationVolume
  snow?: PrecipitationVolume
  weather: OpenWeatherCondition[]
  alerts?: string[]
}

export type OneCallHourlyRecord = {
  dt: number
  temp: number
  feels_like: number
  pressure: number
  humidity: number
  dew_point: number
  uvi: number
  clouds: number
  visibility: number
  wind_speed: number
  wind_gust?: number
  wind_deg: number
  pop: number
  rain?: PrecipitationVolume
  snow?: PrecipitationVolume
  weather: OpenWeatherCondition[]
  alerts?: string[]
}

export type OneCallDailyTemp = {
  day: number
  min: number
  max: number
  night: number
  eve: number
  morn: number
}

export type OneCallDailyFeelsLike = {
  day: number
  night: number
  eve: number
  morn: number
}

export type OneCallDailyRecord = {
  dt: number
  sunrise?: number
  sunset?: number
  moonrise?: number
  moonset?: number
  moon_phase?: number
  temp: OneCallDailyTemp
  feels_like: OneCallDailyFeelsLike
  pressure: number
  humidity: number
  dew_point: number
  wind_speed: number
  wind_deg: number
  wind_gust?: number
  weather: OpenWeatherCondition[]
  clouds: number
  pop: number
  uvi: number
  rain?: number | PrecipitationVolume
  snow?: number | PrecipitationVolume
  alerts?: string[]
}

export type OneCallResponse<T> = {
  lat: number
  lon: number
  timezone: string
  timezone_offset: number
  data: T[]
  next?: string
  prev?: string
}

export type ReverseGeocodingResult = {
  name: string
  local_names?: Record<string, string>
  lat: number
  lon: number
  country: string
  state?: string
}
