<script lang="ts">
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import { weatherToMdiIcon } from './utils'
  import { kelvinToCelsius, kelvinToFahrenheit } from '@melledijkstra/toolbox'

  export type WeatherInfoProps = {
    iconId: string
    location: string
    temperatureKelvin: number
    displayUnit?: 'C' | 'F'
  }

  const {
    iconId,
    location,
    temperatureKelvin,
    displayUnit = 'C',
  }: WeatherInfoProps = $props()

  const temperature = $derived.by(() => {
    if (displayUnit === 'F') {
      if (temperatureKelvin !== undefined)
        return kelvinToFahrenheit(temperatureKelvin)
    } else {
      if (temperatureKelvin !== undefined)
        return kelvinToCelsius(temperatureKelvin)
    }
  })

  const temperatureSymbol = $derived(displayUnit === 'F' ? '°F' : '°C')
</script>

<div class="flex flex-col items-end text-black dark:text-white">
  <div class="flex flex-row items-center gap-1">
    <Icon path={weatherToMdiIcon(iconId)} size={20} />
    <span class="text-base">{temperature}<sup>{temperatureSymbol}</sup></span>
  </div>
  <span
    title={location}
    class="text-xs max-w-20 overflow-hidden text-ellipsis whitespace-nowrap"
    >{location}</span
  >
</div>
