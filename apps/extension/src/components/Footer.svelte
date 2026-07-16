<script lang="ts">
  import { settingsStore } from '@/settings/index.svelte'
  import { appState } from '@/app-state.svelte'
  import SettingsMenuItem from '../settings/SettingsMenuItem.svelte'
  import ImageRefreshButton from './ImageRefreshButton.svelte'
  import Quotes from './atoms/Quotes.svelte'
  import ModuleLoader from './ModuleLoader.svelte'
</script>

<footer class={[
  'flex flex-row justify-between content-end items-end p-6',
  'bg-gradient-to-t from-gray-700/50 from-10% to-transparent',
]}>
  <!-- BOTTOM LEFT -->
  <div class="flex flex-row gap-3">
    <SettingsMenuItem />
    <ImageRefreshButton />
  </div>

  {#if settingsStore.ui.showQuotes && appState.mode !== 'focus'}
    <Quotes />
  {/if}

  <div class="flex flex-row gap-5">
    {#if settingsStore.modules.notes}
      <ModuleLoader id="notes" />
    {/if}
    {#if settingsStore.modules.google_tasks}
      <ModuleLoader id="google_tasks" />
    {/if}
  </div>
</footer>
