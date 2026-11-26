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
    mapCurrentWeatherToPanel,
    mapDailyToPanel,
    mapHourlyToPanel,
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

  const panelCurrent = $derived(
    weatherQuery.data
      ? mapCurrentWeatherToPanel(weatherQuery.data, dailyQuery.data?.[0])
      : undefined
  )

  const panelHourly = $derived(
    weatherQuery.data && hourlyQuery.data
      ? mapHourlyToPanel(hourlyQuery.data, weatherQuery.data.timezoneOffset)
      : []
  )

  const panelDaily = $derived(
    weatherQuery.data && dailyQuery.data
      ? mapDailyToPanel(dailyQuery.data, weatherQuery.data.timezoneOffset)
      : []
  )

  const updatedLabel = $derived(
    formatRelativeUpdatedAt(weatherQuery.dataUpdatedAt || undefined)
  )

  function handleRefresh() {
    void weatherQuery.refetch()
    if (isOpen) {
      void hourlyQuery.refetch()
      void dailyQuery.refetch()
    }
  }
</script>

{#if weatherQuery?.data && panelCurrent}
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
      current={panelCurrent}
      hourly={panelHourly}
      daily={panelDaily}
      isHourlyLoading={hourlyQuery.isPending}
      isDailyLoading={dailyQuery.isPending}
      hourlyError={hourlyQuery.isError}
      dailyError={dailyQuery.isError}
      {isRefreshing}
      {updatedLabel}
      onRefresh={handleRefresh}
      onRetryHourly={() => void hourlyQuery.refetch()}
      onRetryDaily={() => void dailyQuery.refetch()}
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
