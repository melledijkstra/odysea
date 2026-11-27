import type {
  OneCallCurrentRecord,
  OneCallDailyRecord,
  OneCallHourlyRecord,
  OneCallResponse,
  ReverseGeocodingResult,
} from '../definitions/openweathermap'

export const WEATHER_TEST_POSITION = { lat: 52.37, lon: 4.89 }

export const CURRENT_WEATHER_FIXTURE: OneCallResponse<OneCallCurrentRecord> = {
  lat: WEATHER_TEST_POSITION.lat,
  lon: WEATHER_TEST_POSITION.lon,
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

export const HOURLY_FORECAST_FIXTURE: OneCallResponse<OneCallHourlyRecord> = {
  lat: WEATHER_TEST_POSITION.lat,
  lon: WEATHER_TEST_POSITION.lon,
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

export const DAILY_FORECAST_FIXTURE: OneCallResponse<OneCallDailyRecord> = {
  lat: WEATHER_TEST_POSITION.lat,
  lon: WEATHER_TEST_POSITION.lon,
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

export const REVERSE_GEOCODING_FIXTURE: ReverseGeocodingResult[] = [
  {
    name: 'Amsterdam',
    lat: WEATHER_TEST_POSITION.lat,
    lon: WEATHER_TEST_POSITION.lon,
    country: 'NL',
  },
]
