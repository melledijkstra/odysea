<script lang="ts">
  import Input from '@/components/atoms/Input.svelte'
  import { settings, settingsStore } from '@/settings/index.svelte'
  import Toggle from '../atoms/Toggle.svelte'

  let unsplashQuery = $state(settingsStore.ui.dailyImageQuery)
</script>

<h1 class="mb-2 text-xl">Appearance Settings</h1>
<Input
  label="Unsplash Query"
  name="unsplash-query"
  placeholder="Unsplash Query"
  type="text"
  bind:value={unsplashQuery}
  onkeydown={(e) => {
    if (e.key === 'Enter') {
      settingsStore.ui.dailyImageQuery = unsplashQuery
      settings.saveSettingsToStorage()
    }
  }}
/>

<Toggle
  label="Show quotes"
  name="show-quotes"
  parentClass="mt-5"
  onchange={settings.saveSettingsToStorage}
  bind:checked={settingsStore.ui.showQuotes}
/>
