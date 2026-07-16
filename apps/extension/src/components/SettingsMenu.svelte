<script lang="ts">
  import { settingsStore } from '@/settings/index.svelte'
  import NetworkTab from '@/components/settings-tabs/NetworkTab.svelte'
  import AboutTab from '@/components/settings-tabs/AboutTab.svelte'
  import ExportTab from '@/components/settings-tabs/ExportTab.svelte'
  import AppearanceTab from '@/components/settings-tabs/AppearanceTab.svelte'
  import AuthenticationTab from '@/components/settings-tabs/AuthenticationTab.svelte'
  import ModulesTab from '@/components/settings-tabs/ModulesTab.svelte'
  import GeneralTab from '@/components/settings-tabs/GeneralTab.svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { Separator, Tabs } from 'bits-ui'

  const sections = [
    'general',
    'modules',
    'authentication',
    'appearance',
    'network',
    'export',
    'about',
  ] as const

  type Section = (typeof sections)[number]

  const props: HTMLAttributes<HTMLDivElement> = $props()

  let tab = $state<Section>(getSelectedTabFromUrl() ?? 'general')

  function getSelectedTabFromUrl(): Section | undefined {
    const hash = document.location.hash.replace('#', '')
    if (hash && sections.includes(hash as Section)) {
      return hash as Section
    }
  }

  function selectTab(value: Section) {
    tab = value
    document.location.hash = value.toString()
  }
</script>

<Tabs.Root
  orientation="vertical"
  class="flex h-full"
  bind:value={() => tab, selectTab}
>
  <Tabs.List
    class={['p-5', 'flex flex-col text-zinc-600 dark:text-white', props.class]}
  >
    {#each sections as sectionName (sectionName)}
      <Tabs.Trigger
        value={sectionName}
        class={[
          sectionName === tab ? 'underline' : '',
          'dark:hover:text-slate-300 hover:text-zinc-800',
          'text-left text-lg font-bold capitalize',
        ]}
      >
        {sectionName}
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
  <Separator.Root
    class="w-px h-full dark:bg-zinc-200 bg-zinc-700 mx-2"
    orientation="vertical"
  />
  {#each sections as sectionName (sectionName)}
    <Tabs.Content value={sectionName} class="flex-1 p-5 overflow-y-auto">
      {#if sectionName === 'general' && !settingsStore.loaded}
        <div>Loading...</div>
      {/if}
      {#if sectionName === 'general'}
        <GeneralTab />
      {:else if sectionName === 'modules'}
        <ModulesTab />
      {:else if sectionName === 'authentication'}
        <AuthenticationTab />
      {:else if sectionName === 'appearance'}
        <AppearanceTab />
      {:else if sectionName === 'network'}
        <NetworkTab />
      {:else if sectionName === 'export'}
        <ExportTab />
      {:else if sectionName === 'about'}
        <AboutTab />
      {/if}
    </Tabs.Content>
  {/each}
</Tabs.Root>
