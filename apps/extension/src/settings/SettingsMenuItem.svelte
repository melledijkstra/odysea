<script lang="ts">
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import PopPanel from '@melledijkstra/ui/svelte/PopPanel.svelte'
  import SettingsMenu from '@/components/SettingsMenu.svelte'
  import { Popover } from 'bits-ui'
  import { mdiTuneVertical } from '@mdi/js'
</script>

<Popover.Root>
  <Popover.Trigger
    class={[
      'dark:text-white/70 dark:hover:text-white text-zinc-500 hover:text-zinc-700',
      'block cursor-pointer transition-colors',
    ]}
  >
    <Icon path={mdiTuneVertical} size={25} />
  </Popover.Trigger>
  <PopPanel panelProps={{ size: 'large', nopadding: true }}>
    <SettingsMenu />
  </PopPanel>
</Popover.Root>
