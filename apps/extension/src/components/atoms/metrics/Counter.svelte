<script lang="ts">
  import type { CounterMetric } from '@/modules/trackers/types'
  import { trackers } from '@/modules/trackers/state.svelte'
  import { fade } from 'svelte/transition'
  import { mdiMinus, mdiPlus } from '@mdi/js'
  import IconButton from '@melledijkstra/ui/svelte/IconButton.svelte'

  const { metric }: { metric: CounterMetric } = $props()

  function increment() {
    trackers.updateMetric(metric.id, { value: metric.value + 1 })
  }

  function decrement() {
    trackers.updateMetric(metric.id, { value: metric.value - 1 })
  }
</script>

<div transition:fade class="flex items-center gap-2 group/counter dark:text-white text-black bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg border border-white/10 transition-colors relative overflow-hidden">
  <div class="flex flex-col text-right">
    <p class="text-base font-bold leading-none">{metric.value}</p>
    <p class="text-[0.65rem] opacity-70 leading-none mt-1">{metric.name}</p>
  </div>

  <div class="flex flex-col opacity-0 group-hover/counter:opacity-100 transition-opacity absolute right-0 inset-y-0 bg-zinc-800/90 items-center justify-center border-l border-white/10">
    <IconButton
      icon={mdiPlus}
      size={16}
      onclick={increment}
      class="hover:text-primary !p-0.5 rounded-none rounded-tr border-b border-white/10 h-1/2 w-5 flex items-center justify-center"
    />
    <IconButton
      icon={mdiMinus}
      size={16}
      onclick={decrement}
      class="hover:text-primary !p-0.5 rounded-none rounded-br h-1/2 w-5 flex items-center justify-center"
    />
  </div>
</div>
