import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WeatherClient } from './weather'
import {
  CURRENT_WEATHER_FIXTURE,
  DAILY_FORECAST_FIXTURE,
  HOURLY_FORECAST_FIXTURE,
  REVERSE_GEOCODING_FIXTURE,
  WEATHER_TEST_POSITION,
} from '../fixtures/weather'

const API_KEY = 'test-api-key'

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
    const fetchMock = mockFetchResponse(CURRENT_WEATHER_FIXTURE)
    vi.stubGlobal('fetch', fetchMock)

    const client = new WeatherClient(API_KEY)
    const result = await client.getCurrentWeather(WEATHER_TEST_POSITION)

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.openweathermap.org/data/4.0/onecall/current?lat=${WEATHER_TEST_POSITION.lat}&lon=${WEATHER_TEST_POSITION.lon}&appid=${API_KEY}`,
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
    vi.stubGlobal(
      'fetch',
      mockFetchResponse({ ...CURRENT_WEATHER_FIXTURE, data: [] })
    )
    const client = new WeatherClient(API_KEY)
    expect(
      await client.getCurrentWeather(WEATHER_TEST_POSITION)
    ).toBeUndefined()
  })

  it('fetches and maps hourly forecast', async () => {
    const fetchMock = mockFetchResponse(HOURLY_FORECAST_FIXTURE)
    vi.stubGlobal('fetch', fetchMock)

    const client = new WeatherClient(API_KEY)
    const result = await client.getHourlyForecast(WEATHER_TEST_POSITION)

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.openweathermap.org/data/4.0/onecall/timeline/1h?lat=${WEATHER_TEST_POSITION.lat}&lon=${WEATHER_TEST_POSITION.lon}&appid=${API_KEY}`,
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
    const fetchMock = mockFetchResponse(DAILY_FORECAST_FIXTURE)
    vi.stubGlobal('fetch', fetchMock)

    const client = new WeatherClient(API_KEY)
    const result = await client.getDailyForecast(WEATHER_TEST_POSITION)

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.openweathermap.org/data/4.0/onecall/timeline/1day?lat=${WEATHER_TEST_POSITION.lat}&lon=${WEATHER_TEST_POSITION.lon}&appid=${API_KEY}`,
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
    const fetchMock = mockFetchResponse(REVERSE_GEOCODING_FIXTURE)
    vi.stubGlobal('fetch', fetchMock)

    const client = new WeatherClient(API_KEY)
    const name = await client.getLocationName(WEATHER_TEST_POSITION)

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${WEATHER_TEST_POSITION.lat}&lon=${WEATHER_TEST_POSITION.lon}&limit=1&appid=${API_KEY}`,
      expect.any(Object)
    )
    expect(name).toBe('Amsterdam')
  })
})
