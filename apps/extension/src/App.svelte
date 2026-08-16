<script lang="ts">
  import { settings } from '@/settings/index.svelte'
  import { appState } from '@/app-state.svelte.ts'
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
  import { AuthState, setAuthContext } from './oauth2/auth.state.svelte'

  const authState = new AuthState()

  authState.initialize()

  setAuthContext(authState)
</script>

<svelte:head>
  <title>{appState.title}</title>
</svelte:head>

{#await settings.initialize() then}
  <QueryClientProvider client={queryClient}>
    <SvelteQueryDevtools buttonPosition="top-right" />
    <ModulesInitializer />

    <NotificationCenter position="bottom-right" />

    <Layout mode={appState.mode}>
      {#snippet top()}
        <TopBar />
      {/snippet}

      {#snippet middle()}
        {#if appState.mode === 'default'}
          <DefaultModeContent />
        {:else if appState.mode === 'breathing'}
          <ModuleLoader id="well_being" type="scene" />
        {:else if appState.mode === 'focus'}
          <ModuleLoader id="focus" type="scene" />
        {:else}
          <p class="text-white text-lg">Not yet implemented!</p>
        {/if}
      {/snippet}

      {#snippet bottom()}
        <Footer />
      {/snippet}
    </Layout>
  </QueryClientProvider>
{/await}
