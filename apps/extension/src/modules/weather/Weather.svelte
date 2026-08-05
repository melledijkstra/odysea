<script lang="ts">
  import { usePositionQuery, useWeatherQuery } from '@/api/weather'
  import { mdiCloudOff } from '@mdi/js'
  import IconButton from '@/components/atoms/IconButton.svelte'
  import WeatherInfo from './WeatherInfo.svelte'

  const positionQuery = usePositionQuery()
  const weatherQuery = useWeatherQuery(positionQuery)
</script>

{#if weatherQuery?.data}
  <WeatherInfo
    iconId={weatherQuery.data.icon}
    temperatureKelvin={weatherQuery.data.temperature}
    displayUnit="C"
    location={weatherQuery.data.location}
  />
{:else if weatherQuery?.isError}
  <IconButton icon={mdiCloudOff} onclick={() => weatherQuery.refetch()} />
{/if}
