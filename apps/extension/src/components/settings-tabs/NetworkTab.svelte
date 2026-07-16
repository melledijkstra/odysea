<script lang="ts">
  import Input from '@/components/atoms/Input.svelte'
  import type { SettingsState } from '@/settings/index.svelte'
  import { settings, settingsStore } from '@/settings/index.svelte'

  let databaseUri = $state(settingsStore.network.databaseUri)
  let serverlessHost = $state(settingsStore.network.serverlessHost)

  const onKeyDown = (e: KeyboardEvent, settingsKey: keyof SettingsState['network'], value: string) => {
    if (e.key === 'Enter') {
      settingsStore.network[settingsKey] = value
      settings.saveSettingsToStorage()
    }
  }
</script>

<h1 class="text-xl mb-2">Network Settings</h1>
<Input
  class="mb-2"
  label="Database URI"
  type="url"
  bind:value={databaseUri}
  onkeydown={e => onKeyDown(e, 'databaseUri', databaseUri)}
/>
<Input
  label="Serverless Host"
  type="url"
  pattern="https?://.+"
  bind:value={serverlessHost}
  onkeydown={e => onKeyDown(e, 'serverlessHost', serverlessHost)}
/>
