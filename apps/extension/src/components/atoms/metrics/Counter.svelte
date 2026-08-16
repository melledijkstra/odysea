<script lang="ts">
  import type { CounterMetric } from '@/modules/trackers/types'
  import { trackers } from '@/modules/trackers/state.svelte'
  import { fade } from 'svelte/transition'
  import { mdiMinus, mdiPlus } from '@mdi/js'
  import IconButton from '@melledijkstra/ui/svelte/IconButton.svelte'
  import { Tracker } from '@melledijkstra/ui/svelte'

  const { metric }: { metric: CounterMetric } = $props()

  function increment() {
    trackers.updateMetric(metric.id, { value: metric.value + 1 })
  }

  function decrement() {
    trackers.updateMetric(metric.id, { value: metric.value - 1 })
  }
</script>

<div transition:fade>
  <Tracker.Root
    class="group/counter flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2 py-2 rounded-lg border border-white/10 transition-colors relative overflow-hidden"
  >
    <Tracker.Metric>{metric.value}</Tracker.Metric>
    <Tracker.Title>{metric.name}</Tracker.Title>
    <div
      class="flex flex-row opacity-0 group-hover/counter:opacity-100 transition-opacity absolute bottom-0 inset-x-0 bg-slate-500/90 items-center justify-center border-l border-white/10"
    >
      <IconButton
        icon={mdiMinus}
        size={16}
        onclick={decrement}
        class="hover:text-primary p-0.5 rounded-none rounded-br h-1/2 w-5 flex items-center justify-center"
      />
      <IconButton
        icon={mdiPlus}
        size={16}
        onclick={increment}
        class="hover:text-primary p-0.5 rounded-none rounded-tr border-b border-white/10 h-1/2 w-5 flex items-center justify-center"
      />
    </div>
  </Tracker.Root>
</div>
