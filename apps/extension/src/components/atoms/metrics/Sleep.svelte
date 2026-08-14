<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { fade } from 'svelte/transition'
  import { Trackers } from './index'

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
  <Trackers.Root class={['text-right', props.class]}>
    <Trackers.Metric>{formatted}</Trackers.Metric>
    <Trackers.IconTitle src="/icons/google-health.svg" alt="Google Health" class="justify-end">Sleep</Trackers.IconTitle>
  </Trackers.Root>
</div>
