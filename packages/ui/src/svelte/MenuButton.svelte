<script lang="ts">
  import type { Tooltip as TooltipType } from 'bits-ui'
  import Tooltip from './Tooltip.svelte'
  import Icon from './Icon.svelte'

  export type MenuButtonProps = {
    mdiIcon: string
    tooltip?: string
  } & TooltipType.TriggerProps

  const { mdiIcon, tooltip, ...triggerProps }: MenuButtonProps = $props()
</script>

<Tooltip
  disabled={!tooltip}
  triggerProps={{
    class: [
      'text-white/70 hover:text-white',
      'block cursor-pointer transition-colors',
    ],
    ...triggerProps,
  }}
>
  {#snippet trigger()}
    <Icon path={mdiIcon} size={36} />
  {/snippet}

  {tooltip}
</Tooltip>
