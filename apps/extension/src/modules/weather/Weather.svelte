<script lang="ts">
  import { useWeatherQuery } from '@/queries/weather'
  import { usePositionQuery } from '@/queries/position'
  import { mdiCloudOff } from '@mdi/js'
  import IconButton from '@melledijkstra/ui/svelte/IconButton.svelte'
  import WeatherInfo from './WeatherInfo.svelte'
  import WeatherInfoSkeleton from './WeatherInfoSkeleton.svelte'

  const positionQuery = usePositionQuery()
  const weatherQuery = useWeatherQuery(positionQuery)

  const isPending = $derived(positionQuery.isPending && weatherQuery.isPending)
  const failed = $derived(positionQuery.isError || weatherQuery.isError)
</script>

{#if weatherQuery?.data}
  <WeatherInfo
    iconId={weatherQuery.data.icon}
    temperatureKelvin={weatherQuery.data.temperature}
    displayUnit="C"
    location={weatherQuery.data.location}
  />
{:else if isPending}
  <WeatherInfoSkeleton displayUnit="C" />
{:else if failed}
  <IconButton
    icon={mdiCloudOff}
    onclick={() => weatherQuery.refetch()}
    aria-label="Retry fetching weather"
    title="Retry fetching weather"
  />
{/if}
