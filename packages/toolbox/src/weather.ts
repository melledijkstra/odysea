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
