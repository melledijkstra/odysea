<script lang="ts">
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import { mdiWaterOutline } from '@mdi/js'
  import type { DailyWeather } from './types'
  import {
    computeTempMarkerPercent,
    computeTempRangeBar,
    weatherToMdiIcon,
  } from './utils'

  export type WeatherForecastTabProps = {
    daily?: DailyWeather[]
    currentTemperatureC: number
    isLoading?: boolean
    hasError?: boolean
    onRetry?: () => void
  }

  const {
    daily = [],
    currentTemperatureC,
    isLoading = false,
    hasError = false,
    onRetry,
  }: WeatherForecastTabProps = $props()

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

{#if isLoading && daily.length === 0}
  <div class="space-y-1.5">
    {#each Array.from({ length: 7 }, (_, i) => i) as idx (idx)}
      <div
        class="h-8 rounded-lg bg-black/5 dark:bg-white/10 animate-pulse"
      ></div>
    {/each}
  </div>
{:else if hasError && daily.length === 0}
  <div
    class="flex items-center justify-between p-3 rounded-lg bg-black/5 dark:bg-white/5 text-xs"
  >
    <span class="opacity-70">Couldn't load daily forecast</span>
    {#if onRetry}
      <button onclick={onRetry} class="font-semibold underline cursor-pointer">
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
        <Icon path={weatherToMdiIcon(day.iconId)} size={18} class="mx-auto" />
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
              currentTemperatureC,
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
