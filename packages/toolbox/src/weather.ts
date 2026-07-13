export const fahrenheitToCelsius = (kelvin: number): number =>
  Math.round(kelvin - 273.15)

export const celsiusToFahrenheit = (celcius: number): number =>
  Math.round((celcius * 9) / 5 + 32)
