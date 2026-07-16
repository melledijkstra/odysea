<script lang="ts">
  import type { Tooltip as TooltipType } from 'bits-ui'
  import Tooltip from './Tooltip.svelte'
  import Icon from './Icon.svelte'

  type MenuButtonProps = {
    mdiIcon: string
    tooltip?: string
  } & TooltipType.TriggerProps

  const { mdiIcon, tooltip, ...props }: MenuButtonProps = $props()
</script>

<Tooltip disabled={!tooltip} triggerProps={props}>
  {#snippet trigger()}
    <button class={[
      'text-white/70 hover:text-white',
      'block cursor-pointer transition-colors',
    ]}>
      <Icon path={mdiIcon} size={36} />
    </button>
  {/snippet}

  {tooltip}
</Tooltip>
