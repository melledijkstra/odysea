<script lang="ts">
  import { onMount } from 'svelte'
  import { WeatherClient } from '@/api/weather'
  import { mdiCloudOff } from '@mdi/js'
  import IconButton from '@/components/atoms/IconButton.svelte'
  import { createWeatherState } from './state.svelte'
  import WeatherInfo from './WeatherInfo.svelte'
  import { settingsStore } from '@/settings/index.svelte'

  let { currentWeather, setCurrentWeather } = createWeatherState()
  let client = $state<WeatherClient>(new WeatherClient(() => settingsStore.apiKeys.weather || ''))

  async function retrieveWeather() {
    const weather = await client.getWeather()
    
    if (weather) {
      setCurrentWeather(weather)
    }
  }

  onMount(async () => {
    retrieveWeather()
  })
</script>

{#if currentWeather.data}
  <WeatherInfo
    iconId={currentWeather.data.icon}
    temperatureF={currentWeather.data.temperature}
    displayUnit="C"
    location={currentWeather.data.location}
  />
{:else}
  <IconButton
    icon={mdiCloudOff}
    onclick={retrieveWeather}
  />
{/if}
