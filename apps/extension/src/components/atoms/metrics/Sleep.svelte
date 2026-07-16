<script lang="ts">
  import IconFitbit from '@/icons/IconFitbit.svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { fade } from 'svelte/transition'

  const { minutes, ...props }: { minutes: number } & HTMLAttributes<HTMLDivElement> = $props()

  const hours = $derived(Math.floor(minutes / 60))
  const remainingMins = $derived(minutes % 60)
  const formatted = $derived.by(() => {
    if (!minutes || minutes < 0) {
      return 'No data'
    }

    if (remainingMins === 0) {
      return `${hours}h`
    }

    if (hours > 0) {
      return `${hours}h ${remainingMins}m`
    }
    else {
      return `${remainingMins}m`
    }
  })
</script>

<div
  transition:fade
  {...props}
  class={[
    'text-white rounded-lg text-right',
    props.class,
  ]}>
  <p class="text-base">{formatted}</p>
  <p class="text-xs flex justify-end gap-1 items-center"><IconFitbit /> Sleep</p>
</div>
