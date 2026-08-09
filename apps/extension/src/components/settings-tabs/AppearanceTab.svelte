<script lang="ts">
  import Input from '@melledijkstra/ui/svelte/Input.svelte'
  import TagInput from '@melledijkstra/ui/svelte/TagInput.svelte'
  import { settings, settingsStore } from '@/settings/index.svelte'
  import Toggle from '@melledijkstra/ui/svelte/Toggle.svelte'
</script>

<h1 class="mb-2 text-xl">Appearance Settings</h1>
<Input
  label="Unsplash Query"
  name="unsplash-query"
  placeholder="Unsplash Query"
  type="text"
  bind:value={settingsStore.ui.dailyImageQuery}
  onchange={() => settings.saveSettingsToStorage()}
/>

<TagInput
  label="Unsplash Collections"
  name="unsplash-collections"
  placeholder="Collection ID (e.g., 12345)"
  class="mt-4"
  tags={settingsStore.ui.dailyImageCollections}
  ontagschange={(tags) => {
    settingsStore.ui.dailyImageCollections = tags
    settings.saveSettingsToStorage()
  }}
/>

<Toggle
  label="Show quotes"
  name="show-quotes"
  parentClass="mt-5"
  onchange={settings.saveSettingsToStorage}
  bind:checked={settingsStore.ui.showQuotes}
/>
