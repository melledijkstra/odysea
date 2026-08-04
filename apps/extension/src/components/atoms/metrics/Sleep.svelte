<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { fade } from 'svelte/transition'

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

<div
  transition:fade
  {...props}
  class={['text-white rounded-lg text-right', props.class]}
>
  <p class="text-base">{formatted}</p>
  <p class="text-xs flex justify-end gap-1 items-center">
    <img src="/icons/google-health.svg" alt="Google Health" class="w-3 h-3" />
    Sleep
  </p>
</div>
