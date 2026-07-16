<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Devices from '@/components/musicplayer/Devices.svelte'
  import { devices } from '@/fixtures/spotify/devices'

  const { Story } = defineMeta({
    title: 'Spotify/Devices',
    component: Devices,
    parameters: {
      backgrounds: {
        default: 'dark',
      },
    },
    args: {
      playerDeviceId: devices[0]?.id,
      devices,
    },
  })
</script>

<Story name="Default" />

<Story name="Without active device" args={{
  devices: devices.map(device => ({ ...device, is_active: false })),
}}/>

<Story name="With SDK Version" args={{
  devices,
  playerDeviceId: devices[0]?.id,
  sdkVersion: '4.32.2-fake23',
}}/>
