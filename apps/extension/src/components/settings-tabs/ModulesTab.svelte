<script lang="ts">
  import { MODULE_CONFIG } from '@/modules'
  import { settings, DEFAULT_SETTINGS, settingsStore } from '@/settings/index.svelte'
</script>

<h1 class="text-xl">Modules Settings</h1>
<p class="mb-4 text-gray-400">Enable or disable modules</p>
{#each MODULE_CONFIG as { id, title } (id)}
  <p class="font-bold">
    <input
      disabled={!settingsStore.loaded}
      class="scale-150 mr-2"
      type="checkbox"
      onchange={() => settings.saveSettingsToStorage()}
      bind:checked={settingsStore.modules[id]}
    />
    <span class="text-base">{title}</span>
  </p>
  <p class="text-gray-400">
    {id}: {settingsStore.modules[id]} (default: {DEFAULT_SETTINGS.modules?.[id]})
  </p>
{/each}
