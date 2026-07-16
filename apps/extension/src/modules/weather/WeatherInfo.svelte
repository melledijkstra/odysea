<script lang="ts">
  import Icon from '@/components/atoms/Icon.svelte'
  import { fahrenheitToCelsius, celsiusToFahrenheit, weatherToMdiIcon } from './utils'

  export type WeatherInfoProps = {
    iconId: string
    location: string
    temperatureC?: number
    temperatureF?: number
    displayUnit?: 'C' | 'F'
  }

  const {
    iconId,
    location,
    temperatureC,
    temperatureF,
    displayUnit = 'C',
  }: WeatherInfoProps = $props()

  const temperature = $derived.by(() => {
    if (displayUnit === 'F') {
      if (temperatureF !== undefined) return Math.round(temperatureF)
      if (temperatureC !== undefined) return celsiusToFahrenheit(temperatureC)
    }
    else {
      if (temperatureC !== undefined) return Math.round(temperatureC)
      if (temperatureF !== undefined) return fahrenheitToCelsius(temperatureF)
    }
  })

  const temperatureSymbol = $derived(displayUnit === 'F' ? '°F' : '°C')
</script>

<div class="flex flex-col items-end text-black dark:text-white">
  <div class="flex flex-row items-center gap-1">
    <Icon path={weatherToMdiIcon(iconId)} size={20} />
    <span class="text-lg">{temperature}<sup>{temperatureSymbol}</sup></span>
  </div>
  <span
    class="text-xs max-w-20 overflow-hidden text-ellipsis whitespace-nowrap"
    >{location}</span
  >
</div>
