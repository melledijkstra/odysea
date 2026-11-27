<script lang="ts">
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import {
    mdiEyeOutline,
    mdiGauge,
    mdiWaterOutline,
    mdiWaterPercent,
    mdiWeatherSunsetDown,
    mdiWeatherSunsetUp,
    mdiWeatherWindy,
    mdiWhiteBalanceSunny,
  } from '@mdi/js'
  import type { HourlyWeather, WeatherDetails } from './types'
  import { weatherToMdiIcon } from './utils'

  export type WeatherTodayTabProps = {
    current: WeatherDetails
    hourly?: HourlyWeather[]
    isLoading?: boolean
    hasError?: boolean
    onRetry?: () => void
  }

  const {
    current,
    hourly = [],
    isLoading = false,
    hasError = false,
    onRetry,
  }: WeatherTodayTabProps = $props()
</script>

<!-- Hourly strip -->
<div>
  {#if isLoading && hourly.length === 0}
    <div class="flex gap-2 overflow-hidden">
      {#each Array.from({ length: 7 }, (_, i) => i) as idx (idx)}
        <div
          class="w-14 h-20 rounded-lg bg-black/5 dark:bg-white/10 animate-pulse shrink-0"
        ></div>
      {/each}
    </div>
  {:else if hasError && hourly.length === 0}
    <div
      class="flex items-center justify-between p-2.5 rounded-lg bg-black/5 dark:bg-white/5 text-xs"
    >
      <span class="opacity-70">Couldn't load hourly forecast</span>
      {#if onRetry}
        <button
          onclick={onRetry}
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
          <span class="text-xs font-semibold">{item.temperatureC}°</span>
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
        <Icon path={mdiWeatherSunsetDown} size={12} class="opacity-70" />
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
