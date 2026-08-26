<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { fade } from 'svelte/transition'
  import { Tracker } from '@melledijkstra/ui/svelte'
  import Toggle from '@melledijkstra/ui/svelte/Toggle.svelte'
  import type { Tracker as TrackerModel } from '@/modules/trackers/tracker.svelte'

  const {
    metric,
    ...props
  }: { metric: TrackerModel } & HTMLAttributes<HTMLDivElement> = $props()
</script>

{#if metric.needsAuth}
  <div class="flex flex-col gap-1 items-center" {...props}>
    {#if metric.icon}
      <img src={metric.icon} class="w-[2em]" alt={metric.name} />
    {/if}
    <Toggle
      toggleSize="small"
      checked={false}
      onclick={() => metric.authenticate?.()}
    />
  </div>
{:else}
  <div transition:fade {...props}>
    <Tracker.Root
      class={props.class}
      {...metric.onclick ? { onclick: metric.onclick.bind(metric) } : {}}
    >
      <Tracker.Metric>{metric.formatValue()}</Tracker.Metric>
      {#if metric.icon}
        <Tracker.IconTitle src={metric.icon} alt={metric.name ?? ''}>
          {metric.name}
        </Tracker.IconTitle>
      {:else}
        <Tracker.Title>{metric.name}</Tracker.Title>
      {/if}

      {#if metric.actions && metric.actions.length > 0}
        <Tracker.Actions>
          {#each metric.actions as action (action.id)}
            <Tracker.Action.Item
              icon={action.icon}
              ariaLabel={action.ariaLabel}
              onclick={action.onClick}
            />
          {/each}
        </Tracker.Actions>
      {/if}
    </Tracker.Root>
  </div>
{/if}
