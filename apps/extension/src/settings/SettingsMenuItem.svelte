<script lang="ts">
  import Icon from '@/components/atoms/Icon.svelte'
  import PopPanel from '@/components/atoms/PopPanel.svelte'
  import SettingsMenu from '@/components/SettingsMenu.svelte'
  import { Popover } from 'bits-ui'
  import { mdiTuneVertical } from '@mdi/js'
</script>

<Popover.Root>
  <Popover.Trigger class={[
    'dark:text-white/70 dark:hover:text-white text-zinc-500 hover:text-zinc-700',
    'block cursor-pointer transition-colors',
  ]}>
    <Icon path={mdiTuneVertical} size={25} />
  </Popover.Trigger>
  <PopPanel panelProps={{ nopadding: true }} class='w-[550px] h-80'>
    <SettingsMenu />
  </PopPanel>
</Popover.Root>
