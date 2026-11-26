export const kelvinToCelsius = (kelvin: number): number =>
  Math.round(kelvin - 273.15)

export const kelvinToFahrenheit = (kelvin: number): number =>
  Math.round(((kelvin - 273.15) * 9) / 5 + 32)

export const celsiusToKelvin = (celsius: number): number =>
  Math.round(celsius + 273.15)

export const fahrenheitToCelsius = (fahrenheit: number): number =>
  Math.round(((fahrenheit - 32) * 5) / 9)

export const celsiusToFahrenheit = (celsius: number): number =>
  Math.round((celsius * 9) / 5 + 32)

export const mpsToKmh = (mps: number): number => Math.round(mps * 3.6)

const COMPASS_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const

export type CompassDirection = (typeof COMPASS_DIRECTIONS)[number]

export const windDegToCompass = (deg: number): CompassDirection => {
  const normalized = ((deg % 360) + 360) % 360
  const index = Math.round(normalized / 45) % 8
  return COMPASS_DIRECTIONS[index]
}

export type UvIndexLevel = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme'

export const uvIndexLevel = (uvi: number): UvIndexLevel => {
  if (uvi < 3) return 'Low'
  if (uvi < 6) return 'Moderate'
  if (uvi < 8) return 'High'
  if (uvi < 11) return 'Very High'
  return 'Extreme'
}
