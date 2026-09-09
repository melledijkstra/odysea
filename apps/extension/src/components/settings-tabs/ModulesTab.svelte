<script lang="ts">
  import { MODULE_CONFIG, loadModule } from '@/modules'
  import {
    settings,
    DEFAULT_SETTINGS,
    settingsStore,
  } from '@/settings/index.svelte'
</script>

<h1 class="text-xl mb-1">Modules Settings</h1>
<p class="mb-4 text-gray-400">Enable or disable modules</p>
<div class="space-y-4">
  {#each MODULE_CONFIG as { id, title } (id)}
    <div
      class="border-b border-zinc-200 dark:border-zinc-800 pb-4 last:border-b-0"
    >
      <p class="font-bold flex items-center">
        <input
          disabled={!settingsStore.loaded}
          class="scale-150 mr-2 cursor-pointer"
          type="checkbox"
          onchange={() => settings.saveSettingsToStorage()}
          bind:checked={settingsStore.modules[id]}
        />
        <span class="text-base">{title}</span>
      </p>
      <p class="text-gray-400 text-sm">
        {id}: {settingsStore.modules[id]} (default: {DEFAULT_SETTINGS.modules?.[
          id
        ]})
      </p>

      {#if settingsStore.modules[id]}
        {#await loadModule(id) then mod}
          {#if mod.settings}
            <div class="mt-3 border-zinc-300 dark:border-zinc-700">
              <mod.settings />
            </div>
          {/if}
        {/await}
      {/if}
    </div>
  {/each}
</div>
