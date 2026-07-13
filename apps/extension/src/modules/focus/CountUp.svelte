<script lang="ts">
  import Button from '@/components/atoms/Button.svelte'
  import { Timer } from '@melledijkstra/toolbox'
  import { formatSeconds } from "@melledijkstra/toolbox"
  import { onMount } from 'svelte'

  const { onMinutePassed } = $props()

  let seconds = $state(0)
  let displaySeconds = $derived(formatSeconds(seconds))
  let timer = $state(
    new Timer({
      duration: Infinity,
      interval: 1000
    })
  )

  function start() {
    timer.start()
  }

  function stop() {
    seconds = 0
    timer.stop()
  }

  onMount(() => {
    timer.on('tick', () => {
      if (seconds > 0 && seconds % 60 === 0) {
        onMinutePassed()
      }
      seconds++
    })
  })
</script>

<div class="text-2xl text-white">
  <p>{displaySeconds}</p>

  <Button onclick={start}>start</Button>
  <Button onclick={stop}>stop</Button>
</div>
