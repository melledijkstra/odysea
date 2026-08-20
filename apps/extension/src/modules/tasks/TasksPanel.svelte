<script lang="ts">
  import AuthButton from '@/components/AuthButton.svelte'
  import { GoogleTasksController } from '@/controllers/GoogleTasksController'
  import { GithubTasksController } from '@/controllers/GithubTasksController'
  import PopPanel from '@melledijkstra/ui/svelte/PopPanel.svelte'
  import TasksPanelContent from './TasksPanelContent.svelte'
  import { addNotification } from '@/stores/notifications.svelte'
  import { getAuthContext } from '@/oauth2/auth.state.svelte'
  import { TASKS_SCOPE } from '@/oauth2/scope-registry'

  type Provider = 'google' | 'github'

  const STORAGE_KEY = 'tasks::activeProvider'

  let activeProvider = $state<Provider>(
    (localStorage.getItem(STORAGE_KEY) as Provider) ?? 'google'
  )

  const authState = getAuthContext()

  const providerState = $derived(authState.providers[activeProvider])
  const requiredScopes = $derived(
    activeProvider === 'google' ? [TASKS_SCOPE] : ['repo']
  )

  const googleController = new GoogleTasksController()
  const githubController = new GithubTasksController()

  let activeController = $derived(
    activeProvider === 'google' ? googleController : githubController
  )

  let isInitializing = $state(true)
  let isAuthenticating = $state(false)

  async function triggerAuthFlow() {
    try {
      const isAuthenticated = await activeController.authenticate()
      const grantedScopes = await activeController.auth.getGrantedScopes()
      authState.update(activeProvider, isAuthenticated, grantedScopes)
    } catch (e: unknown) {
      console.error('Authentication error:', e)
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      addNotification(`Authentication failed: ${errorMessage}`, 'error')
    } finally {
      isAuthenticating = false
    }
  }

  $effect(() => {
    localStorage.setItem(STORAGE_KEY, activeProvider)
  })

  $effect(() => {
    isInitializing = true
    activeController.initialize().finally(() => {
      isInitializing = false
    })
  })
</script>

<PopPanel panelProps={{ size: 'small', class: 'flex flex-col h-[300px]' }}>
  <div class="flex items-center gap-2 mb-2 border-b border-gray-200/20 pb-2">
    <button
      class="p-1 rounded transition-colors hover:bg-gray-200/20"
      class:opacity-50={activeProvider !== 'google'}
      onclick={() => (activeProvider = 'google')}
    >
      <img src="icons/google-tasks.svg" class="size-5" alt="Google Tasks" />
    </button>
    <button
      class="p-1 rounded transition-colors hover:bg-gray-200/20 text-black dark:text-white"
      class:opacity-50={activeProvider !== 'github'}
      onclick={() => (activeProvider = 'github')}
    >
      <img
        src="icons/github.svg"
        class="size-5 filter dark:invert"
        alt="GitHub Issues"
      />
    </button>
  </div>

  {#if isInitializing}
    <p class="text-sm text-gray-400">Loading...</p>
  {:else if providerState.isAuthenticated && authState.hasScopes(activeProvider, requiredScopes)}
    <TasksPanelContent
      controller={activeController}
      providerId={activeProvider}
    />
  {:else}
    <p class="mb-2 text-sm text-gray-800 dark:text-gray-200">
      In order to see your tasks, you will need to sign in with {activeProvider ===
      'google'
        ? 'Google'
        : 'GitHub'}
    </p>
    <AuthButton
      provider={activeProvider}
      isLoading={isAuthenticating}
      onclick={triggerAuthFlow}
    />
  {/if}
</PopPanel>
