<script lang="ts">
  import { Tabs } from 'bits-ui'
  import PopPanel from '@melledijkstra/ui/svelte/PopPanel.svelte'
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import IconButton from '@melledijkstra/ui/svelte/IconButton.svelte'
  import {
    mdiEyeOutline,
    mdiGauge,
    mdiMapMarkerOutline,
    mdiRefresh,
    mdiWaterOutline,
    mdiWaterPercent,
    mdiWeatherSunsetDown,
    mdiWeatherSunsetUp,
    mdiWeatherWindy,
    mdiWhiteBalanceSunny,
  } from '@mdi/js'
  import type {
    WeatherPanelCurrent,
    WeatherPanelDailyItem,
    WeatherPanelHourlyItem,
    WeatherPanelTab,
  } from './types'
  import {
    computeTempMarkerPercent,
    computeTempRangeBar,
    weatherToMdiIcon,
  } from './utils'

  export type WeatherPanelProps = {
    location?: string
    current: WeatherPanelCurrent
    hourly?: WeatherPanelHourlyItem[]
    daily?: WeatherPanelDailyItem[]
    isHourlyLoading?: boolean
    isDailyLoading?: boolean
    hourlyError?: boolean
    dailyError?: boolean
    isRefreshing?: boolean
    updatedLabel?: string
    defaultTab?: WeatherPanelTab
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

  let selectedTab = $state<WeatherPanelTab | undefined>(undefined)
  const activeTab = $derived<WeatherPanelTab>(selectedTab ?? defaultTab)

  const overallDailyRange = $derived.by(() => {
    if (daily.length === 0) return { min: 0, max: 0 }
    let min = daily[0].lowC
    let max = daily[0].highC
    for (const day of daily) {
      if (day.lowC < min) min = day.lowC
      if (day.highC > max) max = day.highC
    }
    return { min, max }
  })
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
        () => activeTab, (value) => (selectedTab = value as WeatherPanelTab)
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

      <!-- Today Tab -->
      <Tabs.Content
        value="today"
        class="flex-1 min-h-0 overflow-y-auto scrollbar space-y-3 pr-0.5"
      >
        <!-- Hourly strip -->
        <div>
          {#if isHourlyLoading && hourly.length === 0}
            <div class="flex gap-2 overflow-hidden">
              {#each Array.from({ length: 7 }, (_, i) => i) as idx (idx)}
                <div
                  class="w-14 h-20 rounded-lg bg-black/5 dark:bg-white/10 animate-pulse shrink-0"
                ></div>
              {/each}
            </div>
          {:else if hourlyError && hourly.length === 0}
            <div
              class="flex items-center justify-between p-2.5 rounded-lg bg-black/5 dark:bg-white/5 text-xs"
            >
              <span class="opacity-70">Couldn't load hourly forecast</span>
              {#if onRetryHourly}
                <button
                  onclick={onRetryHourly}
                  class="font-semibold underline cursor-pointer"
                >
                  Retry
                </button>
              {/if}
            </div>
          {:else if hourly.length > 0}
            <div class="flex gap-1.5 overflow-x-auto scrollbar pb-1">
              {#each hourly as item (item.id)}
                <div
                  class="flex flex-col items-center justify-between gap-1 px-2 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 min-w-13 shrink-0"
                >
                  <span class="text-[11px] opacity-70">{item.label}</span>
                  <Icon path={weatherToMdiIcon(item.iconId)} size={18} />
                  <span class="text-xs font-semibold">{item.temperatureC}°</span
                  >
                  <div class="h-3.5 flex items-center">
                    {#if item.precipChance > 0}
                      <span
                        class="flex items-center text-[10px] text-sky-600 dark:text-sky-300"
                      >
                        <Icon path={mdiWaterOutline} size={10} />
                        {item.precipChance}%
                      </span>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Atmospheric Details Grid -->
        <div class="grid grid-cols-3 gap-2">
          <!-- Wind -->
          <div
            class="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
          >
            <div class="flex items-center gap-1 text-[11px] opacity-65 mb-1">
              <Icon path={mdiWeatherWindy} size={13} />
              <span>Wind</span>
            </div>
            <div class="text-sm font-semibold leading-tight">
              {current.windKmh} km/h
            </div>
            <div class="text-[11px] opacity-70 mt-0.5">
              {current.windCompass} ({current.windDeg}°)
              {#if current.windGustKmh !== undefined}
                · Gust {current.windGustKmh}
              {/if}
            </div>
          </div>

          <!-- Humidity -->
          <div
            class="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
          >
            <div class="flex items-center gap-1 text-[11px] opacity-65 mb-1">
              <Icon path={mdiWaterPercent} size={13} />
              <span>Humidity</span>
            </div>
            <div class="text-sm font-semibold leading-tight">
              {current.humidity}%
            </div>
          </div>

          <!-- UV Index -->
          <div
            class="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
          >
            <div class="flex items-center gap-1 text-[11px] opacity-65 mb-1">
              <Icon path={mdiWhiteBalanceSunny} size={13} />
              <span>UV Index</span>
            </div>
            <div class="text-sm font-semibold leading-tight">
              {current.uvi}
            </div>
            <div class="text-[11px] opacity-70 mt-0.5">{current.uviLevel}</div>
          </div>

          <!-- Sunrise / Sunset -->
          <div
            class="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
          >
            <div class="flex items-center gap-1 text-[11px] opacity-65 mb-1">
              <Icon path={mdiWeatherSunsetUp} size={13} />
              <span>Sun</span>
            </div>
            <div class="text-xs font-medium space-y-0.5">
              <div class="flex items-center gap-1">
                <Icon path={mdiWeatherSunsetUp} size={12} class="opacity-70" />
                <span>{current.sunriseTime ?? '—'}</span>
              </div>
              <div class="flex items-center gap-1">
                <Icon
                  path={mdiWeatherSunsetDown}
                  size={12}
                  class="opacity-70"
                />
                <span>{current.sunsetTime ?? '—'}</span>
              </div>
            </div>
          </div>

          <!-- Visibility -->
          <div
            class="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
          >
            <div class="flex items-center gap-1 text-[11px] opacity-65 mb-1">
              <Icon path={mdiEyeOutline} size={13} />
              <span>Visibility</span>
            </div>
            <div class="text-sm font-semibold leading-tight">
              {current.visibilityKm} km
            </div>
          </div>

          <!-- Pressure -->
          <div
            class="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
          >
            <div class="flex items-center gap-1 text-[11px] opacity-65 mb-1">
              <Icon path={mdiGauge} size={13} />
              <span>Pressure</span>
            </div>
            <div class="text-sm font-semibold leading-tight">
              {current.pressureHpa} hPa
            </div>
          </div>
        </div>
      </Tabs.Content>

      <!-- Forecast Tab -->
      <Tabs.Content
        value="forecast"
        class="flex-1 min-h-0 overflow-y-auto scrollbar pr-0.5"
      >
        {#if isDailyLoading && daily.length === 0}
          <div class="space-y-1.5">
            {#each Array.from({ length: 7 }, (_, i) => i) as idx (idx)}
              <div
                class="h-8 rounded-lg bg-black/5 dark:bg-white/10 animate-pulse"
              ></div>
            {/each}
          </div>
        {:else if dailyError && daily.length === 0}
          <div
            class="flex items-center justify-between p-3 rounded-lg bg-black/5 dark:bg-white/5 text-xs"
          >
            <span class="opacity-70">Couldn't load daily forecast</span>
            {#if onRetryDaily}
              <button
                onclick={onRetryDaily}
                class="font-semibold underline cursor-pointer"
              >
                Retry
              </button>
            {/if}
          </div>
        {:else if daily.length > 0}
          <div class="divide-y divide-black/5 dark:divide-white/10">
            {#each daily as day, idx (day.id)}
              {@const bar = computeTempRangeBar(
                day.lowC,
                day.highC,
                overallDailyRange.min,
                overallDailyRange.max
              )}
              <div
                class="grid grid-cols-[3.25rem_1.75rem_2.75rem_2rem_1fr_2rem] items-center gap-2 py-1.5 text-xs"
              >
                <span class={['truncate', idx === 0 && 'font-semibold']}>
                  {day.label}
                </span>
                <Icon
                  path={weatherToMdiIcon(day.iconId)}
                  size={18}
                  class="mx-auto"
                />
                <div class="flex items-center justify-end">
                  {#if day.precipChance > 0}
                    <span
                      class="flex items-center text-[11px] text-sky-600 dark:text-sky-300"
                    >
                      <Icon path={mdiWaterOutline} size={11} />
                      {day.precipChance}%
                    </span>
                  {/if}
                </div>
                <span class="text-right opacity-65">{day.lowC}°</span>
                <div
                  class="relative h-1.5 rounded-full bg-black/10 dark:bg-white/15 overflow-hidden"
                >
                  <div
                    class="absolute top-0 bottom-0 rounded-full bg-linear-to-r from-sky-400 via-amber-400 to-orange-500"
                    style={`left: ${bar.leftPercent}%; width: ${bar.widthPercent}%;`}
                  ></div>
                  {#if idx === 0}
                    {@const marker = computeTempMarkerPercent(
                      current.temperatureC,
                      overallDailyRange.min,
                      overallDailyRange.max
                    )}
                    <div
                      class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white ring-1 ring-black/40"
                      style={`left: ${marker}%;`}
                    ></div>
                  {/if}
                </div>
                <span class="font-semibold">{day.highC}°</span>
              </div>
            {/each}
          </div>
        {/if}
      </Tabs.Content>
    </Tabs.Root>
  </div>
</PopPanel>
