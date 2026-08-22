<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { fade } from 'svelte/transition'
  import { Tracker } from '@melledijkstra/ui/svelte/tracker/index.ts'

  const {
    minutes,
    ...props
  }: { minutes: number | undefined } & HTMLAttributes<HTMLDivElement> = $props()

  const formatted = $derived.by(() => {
    if (!minutes || minutes < 0) {
      return 'No data'
    }

    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60

    if (remainingMins === 0) {
      return `${hours}h`
    }

    if (hours > 0) {
      return `${hours}h ${remainingMins}m`
    } else {
      return `${remainingMins}m`
    }
  })
</script>

<div transition:fade {...props}>
  <Tracker.Root class={['text-right', props.class]}>
    <Tracker.Metric>{formatted}</Tracker.Metric>
    <Tracker.IconTitle
      src="/icons/google-health.svg"
      alt="Google Health"
      class="justify-end">Sleep</Tracker.IconTitle
    >
  </Tracker.Root>
</div>
