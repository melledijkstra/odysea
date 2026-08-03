<script lang="ts">
  import Input from '@/components/atoms/Input.svelte'
  import TagInput from '@/components/atoms/TagInput.svelte'
  import { settings, settingsStore } from '@/settings/index.svelte'
  import Toggle from '../atoms/Toggle.svelte'

  let unsplashQuery = $state(settingsStore.ui.dailyImageQuery)
  let unsplashCollections = $state(settingsStore.ui.dailyImageCollections ?? [])
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

<TagInput
  label="Unsplash Collections"
  name="unsplash-collections"
  placeholder="Collection ID (e.g., 12345)"
  class="mt-4"
  bind:tags={unsplashCollections}
  onkeydown={(e) => {
    if (e.key === 'Enter') {
      settingsStore.ui.dailyImageCollections = unsplashCollections
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
