<script lang="ts">
  import { Tooltip } from 'bits-ui'
  import type { Snippet } from 'svelte'

  export type TooltipProps = Tooltip.RootProps & {
    trigger: Snippet
    children?: Snippet
    triggerProps?: Tooltip.TriggerProps
  }

  let {
    open = $bindable(false),
    children,
    trigger,
    triggerProps,
    ...restProps
  }: TooltipProps = $props()
</script>

<Tooltip.Provider>
  <Tooltip.Root bind:open delayDuration={0} {...restProps}>
    <Tooltip.Trigger {...triggerProps}>
      {@render trigger()}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content
        class="z-10 bg-black/50 text-white text-center py-1 px-2 rounded-md"
        sideOffset={4}
      >
        <Tooltip.Arrow class="text-black/50" />
        {#if children}
          {@render children()}
        {/if}
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
