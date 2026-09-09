<script lang="ts">
  import { settingsStore } from '@/settings/index.svelte'
  import { appState } from '@/app-state.svelte'
  import SettingsMenuItem from '../settings/SettingsMenuItem.svelte'
  import PhotoCredits from './PhotoCredits.svelte'
  import Quotes from './atoms/Quotes.svelte'
  import ModuleLoader from './ModuleLoader.svelte'
</script>

<footer
  class={[
    'grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end p-6',
    'bg-linear-to-t from-gray-700/50 from-10% to-transparent',
  ]}
>
  <!-- BOTTOM LEFT -->
  <div class="flex flex-row gap-3 items-center justify-self-start min-w-0">
    <SettingsMenuItem />
    <PhotoCredits />
  </div>

  <!-- MIDDLE -->
  <div class="justify-self-center text-center px-4">
    {#if settingsStore.ui.showQuotes && appState.mode !== 'focus'}
      <Quotes />
    {/if}
  </div>

  <!-- BOTTOM RIGHT -->
  <div class="flex flex-row gap-5 justify-self-end">
    {#if settingsStore.modules.notes}
      <ModuleLoader id="notes" />
    {/if}
    {#if settingsStore.modules.google_tasks}
      <ModuleLoader id="google_tasks" />
    {/if}
  </div>
</footer>
