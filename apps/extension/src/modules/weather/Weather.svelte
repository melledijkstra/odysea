<script lang="ts">
  import { Popover } from 'bits-ui'
  import {
    useDailyForecastQuery,
    useHourlyForecastQuery,
    useLocationNameQuery,
    useWeatherQuery,
  } from '@/queries/weather'
  import { usePositionQuery } from '@/queries/position'
  import { mdiCloudOff } from '@mdi/js'
  import IconButton from '@melledijkstra/ui/svelte/IconButton.svelte'
  import WeatherInfo from './WeatherInfo.svelte'
  import WeatherInfoSkeleton from './WeatherInfoSkeleton.svelte'
  import WeatherPanel from './WeatherPanel.svelte'
  import {
    formatRelativeUpdatedAt,
    mapCurrentWeather,
    mapDailyWeather,
    mapHourlyWeather,
  } from './utils'

  let isOpen = $state(false)

  const positionQuery = usePositionQuery()
  const weatherQuery = useWeatherQuery(positionQuery)
  const locationQuery = useLocationNameQuery(positionQuery)
  const hourlyQuery = useHourlyForecastQuery(positionQuery, () => isOpen)
  const dailyQuery = useDailyForecastQuery(positionQuery, () => isOpen)

  const isPending = $derived(positionQuery.isPending && weatherQuery.isPending)
  const failed = $derived(positionQuery.isError || weatherQuery.isError)
  const isRefreshing = $derived(
    weatherQuery.isFetching || hourlyQuery.isFetching || dailyQuery.isFetching
  )

  const locationName = $derived(locationQuery.data ?? '')

  const updatedLabel = $derived(
    formatRelativeUpdatedAt(weatherQuery.dataUpdatedAt || undefined)
  )

  function handleRefresh() {
    weatherQuery.refetch()
    if (isOpen) {
      hourlyQuery.refetch()
      dailyQuery.refetch()
    }
  }
</script>

{#if weatherQuery.data}
  {@const currentWeather = mapCurrentWeather(
    weatherQuery.data,
    dailyQuery.data?.[0]
  )}
  {@const hourlyWeather = mapHourlyWeather(
    hourlyQuery.data ?? [],
    weatherQuery.data.timezoneOffset
  )}
  {@const dailyWeather = mapDailyWeather(
    dailyQuery.data ?? [],
    weatherQuery.data.timezoneOffset
  )}
  <Popover.Root bind:open={isOpen}>
    <Popover.Trigger
      class="cursor-pointer rounded-md px-1.5 py-0.5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden transition-colors"
      aria-label="Open weather forecast"
      title="View weather forecast"
    >
      <WeatherInfo
        iconId={weatherQuery.data.icon}
        temperatureKelvin={weatherQuery.data.temperature}
        displayUnit="C"
        location={locationName}
      />
    </Popover.Trigger>
    <WeatherPanel
      location={locationName}
      current={currentWeather}
      hourly={hourlyWeather}
      daily={dailyWeather}
      isHourlyLoading={hourlyQuery.isPending}
      isDailyLoading={dailyQuery.isPending}
      hourlyError={hourlyQuery.isError}
      dailyError={dailyQuery.isError}
      {isRefreshing}
      {updatedLabel}
      onRefresh={handleRefresh}
      onRetryHourly={() => hourlyQuery.refetch()}
      onRetryDaily={() => dailyQuery.refetch()}
    />
  </Popover.Root>
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
