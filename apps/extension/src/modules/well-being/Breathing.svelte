<script lang="ts">
  import { Timer, millisecondsToTime } from '@melledijkstra/toolbox'
  import { onDestroy, onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import { Logger } from '@/logger'

  const logger = new Logger('Breathing')

  const DURATION = 5 * 60 * 1000

  let breatheState = $state<boolean>(true)
  let inhaling = $derived(breatheState)
  let exhaling = $derived(!breatheState)
  let active = $state(false)
  let timer = $state(
    new Timer({
      duration: DURATION
    })
  )
  let timeLeft = $state(millisecondsToTime(DURATION))
  let counter = $state(1)

  function onTick(remainingTime: number) {
    logger.log('tick', {
      breatheState,
      counter
    })

    if (
      (exhaling && counter >= 7) || // exhale for 7 ticks (seconds)
      (inhaling && counter >= 6) // inhale for 5 ticks (seconds)
    ) {
      breatheState = !breatheState
      counter = 1
    } else {
      counter++
    }

    timeLeft = millisecondsToTime(remainingTime)
  }

  function start() {
    active = true
    timer.start()
  }

  function stop() {
    active = false
    breatheState = true
    counter = 1
    timer.stop()
    timeLeft = timer.formatRemainingTime()
  }

  onMount(() => {
    timer.on('tick', onTick)
  })

  onDestroy(() => {
    timer.stop()
  })
</script>

<style>
  .inhaling {
    scale: 150%;
    transition-duration: 6s;
  }

  .exhaling {
    scale: 100%;
    transition-duration: 7s;
  }
</style>

<div class="flex flex-col gap justify-center items-center">
  <button
    onclick={!active ? start : stop}
    class={[
      'overflow-hidden border-2 border-white/20 bg-white/20 p-5 text-white shadow-md backdrop-blur-xs cursor-pointer',
      'flex flex-col items-center justify-center size-60 m-10 duration-1000 text-3xl transition-all text-center rounded-full capitalize',
      active && inhaling ? 'inhaling' : '',
      active && exhaling ? 'exhaling' : ''
    ]}
  >
    {#if active}
      {#key breatheState}
        <span in:fade={{ duration: 1000 }}>
          {breatheState ? 'Inhale' : 'Exhale'}
        </span>
      {/key}
    {/if}
    <span>{timeLeft}</span>
  </button>
</div>
