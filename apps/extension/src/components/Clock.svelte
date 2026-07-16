<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { repeatEvery, getTime, getTimePercentage } from '@melledijkstra/toolbox'

  const ONE_MINUTE = 60 * 1000 // in ms

  type ClockMode = 'percentage' | 'time'

  const CLOCK_STORAGE_KEY = 'clockMode'

  const props: { clockMode?: ClockMode } = $props()

  let time = $state()
  let mode = $state<ClockMode>()
  let cancelTick = $state<() => void>()

  function getDisplayTime() {
    return mode === 'time' ? getTime() : getTimePercentage()
  }

  function toggleMode() {
    mode = mode === 'percentage' ? 'time' : 'percentage'
    localStorage.setItem(CLOCK_STORAGE_KEY, mode)
    time = getDisplayTime()
  }

  function startClock() {
    // run the clock 1 time when executed, then update every second
    time = getDisplayTime()
    cancelTick = repeatEvery(() => {
      time = getDisplayTime()
    }, ONE_MINUTE)
  }

  onMount(async () => {
    // if parent is overriding clockMode then we shouldn't set it based on localStorage
    if (props.clockMode) {
      mode = props.clockMode
    }
    else {
      const clockMode = localStorage.getItem(CLOCK_STORAGE_KEY) as ClockMode
      mode = clockMode ?? 'time'
    }

    startClock()
  })

  onDestroy(() => {
    cancelTick?.()
  })
</script>

<button
  onclick={toggleMode}
  class={[
    'clock empty:min-h-32 time text-white text-10xl antialiased drop-shadow-lg text-shadow-lg/30 cursor-pointer',
    // creates a shadow behind the text
    'relative before:absolute before:inset-[-0.05em] before:bg-black/10 before:blur-xl before:rounded-lg before:z-[-1]',
  ]}
  >{time}</button
>
