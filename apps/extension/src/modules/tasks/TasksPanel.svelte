<script lang="ts">
  import AuthButton from '@/components/AuthButton.svelte'
  import { GoogleTasksController } from '@/controllers/GoogleTasksController'
  import { GithubTasksController } from '@/controllers/GithubTasksController'
  import PopPanel from '@/components/atoms/PopPanel.svelte'
  import TasksPanelContent from './TasksPanelContent.svelte'

  type Provider = 'google' | 'github'
  let activeProvider = $state<Provider>('google')

  const googleController = new GoogleTasksController()
  const githubController = new GithubTasksController()

  let activeController = $derived(
    activeProvider === 'google' ? googleController : githubController
  )

  let isAuthenticated = $state(false)
  let isInitializing = $state(true)

  async function triggerAuthFlow() {
    isAuthenticated = await activeController.auth.authenticate()
  }

  $effect(() => {
    isInitializing = true
    activeController.initialize().then(() => {
      activeController.auth.isAuthenticated().then((auth) => {
        isAuthenticated = auth
        isInitializing = false
      })
    })
  })
</script>

<PopPanel panelProps={{ size: 'small', class: 'flex flex-col' }}>
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
  {:else if isAuthenticated}
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
    <AuthButton provider={activeProvider} onclick={triggerAuthFlow} />
  {/if}
</PopPanel>
