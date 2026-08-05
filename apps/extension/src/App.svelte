<script lang="ts">
  import { settings, settingsStore } from '@/settings/index.svelte'
  import { appState } from '@/app-state.svelte.ts'
  import { state as tasksState } from '@/modules/google-tasks/state.svelte'
  import TopBar from '@/components/topbar/TopBar.svelte'
  import NotificationCenter from '@/components/NotificationCenter.svelte'
  import ModulesInitializer from './components/ModulesInitializer.svelte'
  import Layout from './components/Layout.svelte'
  import ModuleLoader from './components/ModuleLoader.svelte'
  import Footer from './components/Footer.svelte'
  import DefaultModeContent from './components/DefaultModeContent.svelte'
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { queryClient } from '@/queryClient'

  const currentTask = $derived(
    tasksState.tasks.find((task) => task.status === 'needsAction')
  )
</script>

<svelte:head>
  <title>{appState.title}</title>
</svelte:head>

{#snippet renderCurrentTask()}
  <div class="mt-4 text-lg empty:h-7">
    {#if settingsStore.ui.showCurrentTask && currentTask}
      <input type="checkbox" class="scale-150 text-white mr-1" disabled />
      <span
        class="text-white text-lg antialiased drop-shadow-md text-shadow-lg/20"
        >{currentTask.title}</span
      >
    {/if}
  </div>
{/snippet}

{#snippet middleSnippet()}
  {#if appState.mode === 'default'}
    <DefaultModeContent {renderCurrentTask} />
  {:else if appState.mode === 'breathing'}
    <ModuleLoader id="well_being" type="scene" />
  {:else if appState.mode === 'focus'}
    <ModuleLoader id="focus" type="scene" />
  {:else}
    <p class="text-white text-lg">Not yet implemented!</p>
  {/if}
{/snippet}

{#await settings.initialize() then}
  <QueryClientProvider client={queryClient}>
    <SvelteQueryDevtools />
    <ModulesInitializer />

    <NotificationCenter position="bottom-right" />

    <Layout mode={appState.mode}>
      {#snippet top()}
        <TopBar />
      {/snippet}

      {#snippet middle()}
        {@render middleSnippet()}
      {/snippet}

      {#snippet bottom()}
        <Footer />
      {/snippet}
    </Layout>
  </QueryClientProvider>
{/await}
