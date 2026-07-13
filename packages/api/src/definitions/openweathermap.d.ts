type Weather = {
  id: number // 501
  main: string // 'Rain'
  description: string // 'moderate rain'
  icon: string // '10d'
}

export type WeatherResponse = {
  coord: {
    lon: number // 7.367
    lat: number // 45.133
  }
  weather: Weather[]
  base: string // 'stations'
  main: {
    temp: number // 284.2
    feels_like: number // 282.93
    temp_min: number // 283.06
    temp_max: number // 286.82
    pressure: number // 1021
    humidity: number // 60
    sea_level: number // 1021
    grnd_level: number // 910
  }
  visibility: number // 10000
  wind: {
    speed: number // 4.09
    deg: number // 121
    gust?: number // 3.47
  }
  rain?: {
    '1h': number // 2.73
  }
  clouds: {
    all: number // 83
  }
  dt: number // 1726660758
  sys: {
    type: number // 1
    id: number // 6736
    country: string // 'IT'
    sunrise: number // 1726636384
    sunset: number // 1726680975
  }
  timezone: number // 7200
  id: number // 3165523
  name: string // 'Province of Turin'
  cod: number // 200
}
