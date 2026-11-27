<script lang="ts">
  import { Tabs } from 'bits-ui'
  import PopPanel from '@melledijkstra/ui/svelte/PopPanel.svelte'
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import IconButton from '@melledijkstra/ui/svelte/IconButton.svelte'
  import { mdiMapMarkerOutline, mdiRefresh } from '@mdi/js'
  import type {
    DailyWeather,
    HourlyWeather,
    WeatherDetails,
    WeatherTab,
  } from './types'
  import { weatherToMdiIcon } from './utils'
  import WeatherTodayTab from './WeatherTodayTab.svelte'
  import WeatherForecastTab from './WeatherForecastTab.svelte'

  export type WeatherPanelProps = {
    location?: string
    current: WeatherDetails
    hourly?: HourlyWeather[]
    daily?: DailyWeather[]
    isHourlyLoading?: boolean
    isDailyLoading?: boolean
    hourlyError?: boolean
    dailyError?: boolean
    isRefreshing?: boolean
    updatedLabel?: string
    defaultTab?: WeatherTab
    onRefresh?: () => void
    onRetryHourly?: () => void
    onRetryDaily?: () => void
  }

  const {
    location = '',
    current,
    hourly = [],
    daily = [],
    isHourlyLoading = false,
    isDailyLoading = false,
    hourlyError = false,
    dailyError = false,
    isRefreshing = false,
    updatedLabel = '',
    defaultTab = 'today',
    onRefresh,
    onRetryHourly,
    onRetryDaily,
  }: WeatherPanelProps = $props()

  let selectedTab = $state<WeatherTab | undefined>(undefined)
  const activeTab = $derived<WeatherTab>(selectedTab ?? defaultTab)
</script>

<PopPanel align="end" panelProps={{ size: 'medium', class: 'overflow-hidden' }}>
  <div class="flex flex-col h-full min-h-0 gap-3 text-black dark:text-white">
    <!-- Header & Current Hero -->
    <div class="shrink-0">
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-1 min-w-0">
          {#if location}
            <Icon
              path={mdiMapMarkerOutline}
              size={14}
              class="shrink-0 opacity-70"
            />
            <span class="text-xs font-medium truncate" title={location}>
              {location}
            </span>
          {/if}
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          {#if updatedLabel}
            <span class="text-[11px] opacity-60">{updatedLabel}</span>
          {/if}
          {#if onRefresh}
            <IconButton
              icon={mdiRefresh}
              size={16}
              onclick={onRefresh}
              disabled={isRefreshing}
              class={isRefreshing ? 'animate-spin opacity-60' : ''}
              aria-label="Refresh weather"
              title="Refresh weather"
            />
          {/if}
        </div>
      </div>

      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <Icon path={weatherToMdiIcon(current.iconId)} size={44} />
          <div>
            <div class="text-3xl font-bold leading-none">
              {current.temperatureC}<span class="text-lg font-normal">°C</span>
            </div>
            {#if current.description}
              <p class="text-xs capitalize opacity-80 mt-1">
                {current.description}
              </p>
            {/if}
          </div>
        </div>
        <div class="text-right text-xs space-y-0.5 opacity-80">
          <div>Feels like {current.feelsLikeC}°</div>
          {#if current.highC !== undefined && current.lowC !== undefined}
            <div class="font-medium">
              H: {current.highC}° · L: {current.lowC}°
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <Tabs.Root
      bind:value={
        () => activeTab, (value) => (selectedTab = value as WeatherTab)
      }
      class="flex flex-col flex-1 min-h-0 gap-2.5"
    >
      <Tabs.List
        class="grid grid-cols-2 p-1 rounded-lg bg-black/5 dark:bg-white/10 shrink-0"
      >
        <Tabs.Trigger
          value="today"
          class={[
            'py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer',
            activeTab === 'today'
              ? 'bg-white/80 dark:bg-white/20 text-black dark:text-white shadow-xs'
              : 'opacity-70 hover:opacity-100',
          ]}
        >
          Today
        </Tabs.Trigger>
        <Tabs.Trigger
          value="forecast"
          class={[
            'py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer',
            activeTab === 'forecast'
              ? 'bg-white/80 dark:bg-white/20 text-black dark:text-white shadow-xs'
              : 'opacity-70 hover:opacity-100',
          ]}
        >
          Forecast
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content
        value="today"
        class="flex-1 min-h-0 overflow-y-auto scrollbar space-y-3 pr-0.5"
      >
        <WeatherTodayTab
          {current}
          {hourly}
          isLoading={isHourlyLoading}
          hasError={hourlyError}
          onRetry={onRetryHourly}
        />
      </Tabs.Content>

      <Tabs.Content
        value="forecast"
        class="flex-1 min-h-0 overflow-y-auto scrollbar pr-0.5"
      >
        <WeatherForecastTab
          {daily}
          currentTemperatureC={current.temperatureC}
          isLoading={isDailyLoading}
          hasError={dailyError}
          onRetry={onRetryDaily}
        />
      </Tabs.Content>
    </Tabs.Root>
  </div>
</PopPanel>
