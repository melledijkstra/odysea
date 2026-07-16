import type { WeatherInfo } from '@melledijkstra/api'

export function createWeatherState() {
  const currentWeather = $state<{ data: WeatherInfo | null }>({
    data: null,
  })

  function setCurrentWeather(weather: WeatherInfo) {
    currentWeather.data = weather
  }

  return {
    currentWeather,
    setCurrentWeather,
  }
}
