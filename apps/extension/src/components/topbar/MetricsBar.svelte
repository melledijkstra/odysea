<script lang="ts">
  import { trackers } from '@/modules/trackers/state.svelte'

  const pinnedMetrics = $derived.by(() => {
    return trackers.metrics.filter((metric) => metric.pinned)
  })
</script>

{#if pinnedMetrics.length > 0}
  <div class="flex flex-row gap-5 items-center">
    {#each pinnedMetrics as metric (metric.id)}
      <metric.component {metric} />
    {/each}
  </div>
{/if}
