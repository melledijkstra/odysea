<script lang="ts">
  import SettingsMenu from '@/components/SettingsMenu.svelte'
  import { settings } from './index.svelte'
  import { AuthState, setAuthContext } from '@/oauth2/auth.state.svelte'

  const authState = new AuthState()

  setAuthContext(authState)

  let initPromise = Promise.allSettled([
    settings.initialize(),
    authState.initialize(),
  ])
</script>

<div class="bg-black min-h-screen text-white">
  <div class="container mx-auto p-5">
    <h1 class="text-4xl my-4 font-bold">Homepage Settings</h1>
    <hr />
    {#await initPromise}
      <p class="text-lg mt-5">Loading settings...</p>
    {:then}
      <SettingsMenu />
    {/await}
  </div>
</div>
