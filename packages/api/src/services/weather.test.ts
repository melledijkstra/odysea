import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WeatherClient } from './weather'
import type {
  OneCallCurrentRecord,
  OneCallDailyRecord,
  OneCallHourlyRecord,
  OneCallResponse,
  ReverseGeocodingResult,
} from '../definitions/openweathermap'

const POSITION = { lat: 52.37, lon: 4.89 }
const API_KEY = 'test-api-key'

const CURRENT_FIXTURE: OneCallResponse<OneCallCurrentRecord> = {
  lat: POSITION.lat,
  lon: POSITION.lon,
  timezone: 'Europe/Amsterdam',
  timezone_offset: 3600,
  data: [
    {
      dt: 1777449371,
      sunrise: 1777437375,
      sunset: 1777490344,
      temp: 291.15,
      feels_like: 290.15,
      pressure: 1018,
      humidity: 62,
      dew_point: 283.15,
      uvi: 4.2,
      clouds: 20,
      visibility: 10000,
      wind_speed: 5.5,
      wind_gust: 8.2,
      wind_deg: 225,
      rain: { '1h': 0.5 },
      weather: [
        { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' },
      ],
    },
  ],
}

const HOURLY_FIXTURE: OneCallResponse<OneCallHourlyRecord> = {
  lat: POSITION.lat,
  lon: POSITION.lon,
  timezone: 'Europe/Amsterdam',
  timezone_offset: 3600,
  data: [
    {
      dt: 1777453200,
      temp: 292.15,
      feels_like: 291.5,
      pressure: 1018,
      humidity: 58,
      dew_point: 283.0,
      uvi: 4.8,
      clouds: 15,
      visibility: 10000,
      wind_speed: 5.0,
      wind_deg: 220,
      pop: 0.25,
      weather: [
        { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
      ],
    },
  ],
}

const DAILY_FIXTURE: OneCallResponse<OneCallDailyRecord> = {
  lat: POSITION.lat,
  lon: POSITION.lon,
  timezone: 'Europe/Amsterdam',
  timezone_offset: 3600,
  data: [
    {
      dt: 1777460400,
      sunrise: 1777437375,
      sunset: 1777490344,
      temp: {
        day: 292.15,
        min: 284.15,
        max: 294.15,
        night: 286.15,
        eve: 290.15,
        morn: 285.15,
      },
      feels_like: { day: 291.5, night: 285.5, eve: 289.5, morn: 284.5 },
      pressure: 1018,
      humidity: 55,
      dew_point: 282.5,
      wind_speed: 6.1,
      wind_deg: 210,
      clouds: 10,
      pop: 0.1,
      uvi: 5.4,
      weather: [
        { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
      ],
    },
  ],
}

const REVERSE_GEO_FIXTURE: ReverseGeocodingResult[] = [
  { name: 'Amsterdam', lat: POSITION.lat, lon: POSITION.lon, country: 'NL' },
]

function mockFetchResponse<T>(payload: T) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(payload),
  })
}

describe('WeatherClient (One Call API 4.0)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches and maps current weather', async () => {
    const fetchMock = mockFetchResponse(CURRENT_FIXTURE)
    vi.stubGlobal('fetch', fetchMock)

    const client = new WeatherClient(API_KEY)
    const result = await client.getCurrentWeather(POSITION)

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.openweathermap.org/data/4.0/onecall/current?lat=${POSITION.lat}&lon=${POSITION.lon}&appid=${API_KEY}`,
      expect.any(Object)
    )
    expect(result).toEqual({
      dt: 1777449371,
      timezone: 'Europe/Amsterdam',
      timezoneOffset: 3600,
      temperature: 291.15,
      feelsLike: 290.15,
      description: 'few clouds',
      icon: '02d',
      humidity: 62,
      pressure: 1018,
      uvi: 4.2,
      visibility: 10000,
      clouds: 20,
      dewPoint: 283.15,
      windSpeed: 5.5,
      windGust: 8.2,
      windDeg: 225,
      sunrise: 1777437375,
      sunset: 1777490344,
      rain1h: 0.5,
      snow1h: undefined,
    })
  })

  it('returns undefined when current weather data is empty', async () => {
    vi.stubGlobal('fetch', mockFetchResponse({ ...CURRENT_FIXTURE, data: [] }))
    const client = new WeatherClient(API_KEY)
    expect(await client.getCurrentWeather(POSITION)).toBeUndefined()
  })

  it('fetches and maps hourly forecast', async () => {
    const fetchMock = mockFetchResponse(HOURLY_FIXTURE)
    vi.stubGlobal('fetch', fetchMock)

    const client = new WeatherClient(API_KEY)
    const result = await client.getHourlyForecast(POSITION)

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.openweathermap.org/data/4.0/onecall/timeline/1h?lat=${POSITION.lat}&lon=${POSITION.lon}&appid=${API_KEY}`,
      expect.any(Object)
    )
    expect(result).toEqual([
      {
        dt: 1777453200,
        temperature: 292.15,
        feelsLike: 291.5,
        icon: '01d',
        description: 'clear sky',
        pop: 0.25,
        rain1h: undefined,
        snow1h: undefined,
      },
    ])
  })

  it('fetches and maps daily forecast', async () => {
    const fetchMock = mockFetchResponse(DAILY_FIXTURE)
    vi.stubGlobal('fetch', fetchMock)

    const client = new WeatherClient(API_KEY)
    const result = await client.getDailyForecast(POSITION)

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.openweathermap.org/data/4.0/onecall/timeline/1day?lat=${POSITION.lat}&lon=${POSITION.lon}&appid=${API_KEY}`,
      expect.any(Object)
    )
    expect(result).toEqual([
      {
        dt: 1777460400,
        tempMin: 284.15,
        tempMax: 294.15,
        tempDay: 292.15,
        icon: '01d',
        description: 'clear sky',
        pop: 0.1,
        uvi: 5.4,
        humidity: 55,
        windSpeed: 6.1,
        sunrise: 1777437375,
        sunset: 1777490344,
      },
    ])
  })

  it('fetches location name via reverse geocoding', async () => {
    const fetchMock = mockFetchResponse(REVERSE_GEO_FIXTURE)
    vi.stubGlobal('fetch', fetchMock)

    const client = new WeatherClient(API_KEY)
    const name = await client.getLocationName(POSITION)

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${POSITION.lat}&lon=${POSITION.lon}&limit=1&appid=${API_KEY}`,
      expect.any(Object)
    )
    expect(name).toBe('Amsterdam')
  })
})
