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

export const fahrenheitToCelsius = (kelvin: number): number =>
  Math.round(kelvin - 273.15)

export const celsiusToFahrenheit = (celcius: number): number =>
  Math.round((celcius * 9) / 5 + 32)

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
