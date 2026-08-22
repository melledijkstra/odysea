<script lang="ts">
  import { loadModule, type ModuleID } from '@/modules'
  import { mdiHomeOutline, mdiPlus } from '@mdi/js'
  import { appState, switchAppMode } from '@/app-state.svelte'
  import { settingsStore } from '@/settings/index.svelte'
  import MetricsPanel from '@/modules/trackers/MetricsPanel.svelte'
  import Account from './Account.svelte'
  import Metrics from './MetricsBar.svelte'
  import MenuButton from '@melledijkstra/ui/svelte/MenuButton.svelte'
  import { spotifyState } from '@/modules/spotify/spotify.state.svelte'
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import { Popover } from 'bits-ui'
</script>

{#snippet module(moduleId: ModuleID)}
  {#if settingsStore.modules?.[moduleId]}
    {#await loadModule(moduleId) then Module}
      {#if Module.trigger}
        <Module.trigger />
      {/if}
    {/await}
  {/if}
{/snippet}

<header
  class={[
    'w-full p-6',
    // add vignette effect from top to bottom
    'bg-linear-to-b from-zinc-600/60 to-80% to-transparent',
  ]}
>
  <div
    class="float-left flex flex-row items-center justify-start align-middle gap-5"
  >
    <MenuButton
      onclick={() => switchAppMode('default')}
      tooltip="Home"
      tooltipDisabled={spotifyState.isPanelOpen}
      mdiIcon={mdiHomeOutline}
    />
    {@render module('focus')}
    {@render module('spotify')}
    {@render module('well_being')}
    {@render module('habits')}
  </div>
  <div
    class={[
      appState.mode === 'focus' ? 'invisible' : 'visible',
      'group float-right flex flex-row items-center justify-end align-middle gap-5',
    ]}
  >
    <MetricsPanel>
      {#snippet trigger({ isOpen })}
        <Popover.Trigger
          class={[
            isOpen
              ? 'opacity-100 dark:text-white'
              : 'opacity-0 dark:text-white/70 dark:hover:text-white hover:text-zinc-700 text-zinc-500',
            'group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300 flex flex-col cursor-pointer',
            'text-center',
            'cursor-pointer transition-colors',
          ]}
        >
          <Icon path={mdiPlus} size={24} class="mx-auto" />
          <span class="text-xs">Add</span>
        </Popover.Trigger>
      {/snippet}
    </MetricsPanel>
    <Metrics />
    {@render module('weather')}
    <Account />
  </div>
</header>
