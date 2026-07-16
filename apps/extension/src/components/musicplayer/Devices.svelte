<script lang="ts">
  import type { Device } from 'SpotifyApi'
  import Icon from '@/components/atoms/Icon.svelte'
  import { mdiCellphone, mdiMonitor, mdiSpeaker } from '@mdi/js'
  import { DropdownMenu } from 'bits-ui'
  import type { HTMLAttributes } from 'svelte/elements'

  type DevicesProps = {
    devices: Device[]
    onActivate: (deviceId: string) => void
    playerDeviceId?: string
    sdkVersion?: string
    class?: HTMLAttributes<HTMLDivElement>['class']
  }

  const { playerDeviceId, devices, onActivate, sdkVersion, ...props }: DevicesProps = $props()
  const activeDevice = $derived(devices.find(device => device.is_active))
  const otherDevices = $derived(devices.filter(device => !device.is_active))
  const isActiveDevice = $derived(playerDeviceId === activeDevice?.id)
</script>

{#snippet icon(type: Device['type'])}
  {#if type === 'smartphone'}
    <Icon path={mdiCellphone} size={10} />
  {:else if type === 'computer'}
    <Icon path={mdiMonitor} size={10} />
  {:else if type === 'speaker'}
    <Icon path={mdiSpeaker} size={10} />
  {:else}
    <Icon path={mdiCellphone} size={10} />
  {/if}
{/snippet}

{#snippet device(device: Device)}
  <div class="flex flex-row items-center gap-1">
    {@render icon(device.type)}
    <span class="text-xs">{device.name}</span>
  </div>
{/snippet}

<div
  class={[
    'relative flex justify-between gap-1 py-1 px-2 w-full text-white rounded-b',
    'text-xs',
    'transition-colors duration-1000',
    isActiveDevice ? 'bg-green-700' : 'transparent',
    props.class,
  ]}
>
  {#if sdkVersion}
    <p class="">v{sdkVersion}</p>
  {/if}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger class="hover:underline cursor-pointer">
      {#if activeDevice}
        {@render device(activeDevice)}
      {:else}
        Select Device
      {/if}
    </DropdownMenu.Trigger>

    <!-- Device Selection Dropdown -->
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        class="z-50 flex flex-col gap-1 p-2 bg-black/80 rounded text-white shadow-md"
      >
        <DropdownMenu.Arrow class="text-black/80" />
        {#each otherDevices as device (device.id)}
          <DropdownMenu.Item
            onSelect={() => onActivate(device.id)}
            closeOnSelect
            class="text-xs cursor-pointer flex flex-row gap-1 p-1 rounded items-center focus:bg-green-800"
          >
            {@render icon(device.type)}
            {device.name}
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
</div>
