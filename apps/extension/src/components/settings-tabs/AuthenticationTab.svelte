<script lang="ts">
  import { settingsStore, settings } from '@/settings/index.svelte'
  import AuthButton from '@/components/AuthButton.svelte'
  import { AuthClient } from '@melledijkstra/extension'
  import {
    GoogleAuthProvider,
    SpotifyAuthProvider,
    GithubAuthProvider,
    type OauthProvider,
  } from '@/oauth2/providers'
  import Input from '@melledijkstra/ui/svelte/Input.svelte'
  import Spinner from '@melledijkstra/ui/svelte/Spinner.svelte'
  import { onMount, onDestroy } from 'svelte'
  import browser from 'webextension-polyfill'
  import { Logger } from '@/logger'

  const logger = new Logger('AuthenticationTab')

  const clients = {
    google: new AuthClient(new GoogleAuthProvider()),
    spotify: new AuthClient(new SpotifyAuthProvider()),
    github: new AuthClient(new GithubAuthProvider()),
  } as const

  const authState = $state({
    google: false,
    spotify: false,
    github: false,
  })

  const grantedScopes = $state<Record<OauthProvider, string[]>>({
    google: [],
    spotify: [],
    github: [],
  })

  function formatScope(scope: string): string {
    if (scope === 'https://www.googleapis.com/auth/tasks') return 'Tasks'
    if (scope === 'https://www.googleapis.com/auth/googlehealth.sleep.readonly') return 'Health (Sleep)'
    if (scope === 'https://www.googleapis.com/auth/photoslibrary.readonly') return 'Photos'
    if (scope === 'https://www.googleapis.com/auth/userinfo.profile') return 'Profile'
    if (scope.startsWith('https://')) {
      const parts = scope.split('/')
      return parts[parts.length - 1]
    }
    return scope
  }

  function handleStorageChange(
    changes: Record<string, browser.Storage.StorageChange>
  ) {
    for (const key of Object.keys(clients)) {
      const provider = key as OauthProvider
      const storageKey = clients[provider].storageKey
      if (changes[storageKey]) {
        authState[provider] = !!changes[storageKey].newValue
        if (authState[provider]) {
          clients[provider].getGrantedScopes().then(scopes => {
            grantedScopes[provider] = scopes
          })
        } else {
          grantedScopes[provider] = []
        }
      }
    }
  }

  onMount(() => {
    browser.storage.local.onChanged.addListener(handleStorageChange)
  })

  onDestroy(() => {
    browser.storage.local.onChanged.removeListener(handleStorageChange)
  })

  async function retrieveAuthState() {
    logger.log('Retrieving authentication state from all providers...')
    for (const key of Object.keys(clients)) {
      const provider = key as OauthProvider
      authState[provider] = await clients[provider].isAuthenticated()
      if (authState[provider]) {
        grantedScopes[provider] = await clients[provider].getGrantedScopes()
      } else {
        grantedScopes[provider] = []
      }
    }
  }

  async function authenticate(provider: OauthProvider) {
    logger.log('Authenticating with', provider)
    const token = await clients[provider].getAuthToken(true)
    authState[provider] = !!token
  }

  async function deauthenticate(provider: OauthProvider) {
    logger.log('Deauthenticating from', provider)
    await clients[provider].deauthenticate()
    authState[provider] = false
  }
</script>

<h1 class="text-xl mb-3">API Keys</h1>
<div class="flex flex-col gap-3 mb-6">
  <Input
    label="OpenWeather API Key"
    bind:value={settingsStore.apiKeys.weather}
    onchange={() => settings.saveSettingsToStorage()}
  />
  <Input
    label="Google Client ID"
    bind:value={settingsStore.apiKeys.google}
    onchange={() => settings.saveSettingsToStorage()}
  />
  <Input
    label="Spotify Client ID"
    bind:value={settingsStore.apiKeys.spotify}
    onchange={() => settings.saveSettingsToStorage()}
  />
  <Input
    label="GitHub Client ID"
    bind:value={settingsStore.apiKeys.github_client_id}
    onchange={() => settings.saveSettingsToStorage()}
  />
  <Input
    type="password"
    label="GitHub Client Secret"
    bind:value={settingsStore.apiKeys.github_client_secret}
    onchange={() => settings.saveSettingsToStorage()}
  />
</div>

<h1 class="text-xl mb-3">Authentication</h1>
{#await retrieveAuthState()}
  <div class="flex p-4">
    <Spinner class="text-gray-400" />
  </div>
{:then}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each Object.keys(clients) as key}
      {@const provider = key as OauthProvider}
      <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-4">
            <strong class="capitalize">{provider}</strong>
            <span class="text-xs px-2 py-1 rounded-full font-medium {authState[provider] ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}">
              {authState[provider] ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {#if authState[provider] && grantedScopes[provider].length > 0}
            <div class="mb-4">
              <p class="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Granted Permissions</p>
              <ul class="text-sm list-disc list-inside text-gray-700 dark:text-gray-300">
                {#each grantedScopes[provider] as scope}
                  <li>{formatScope(scope)}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
        <AuthButton
          class="w-full mt-4"
          authenticated={authState[provider]}
          provider={provider}
          onclick={() =>
            authState[provider] ? deauthenticate(provider) : authenticate(provider)}
        />
      </div>
    {/each}
  </div>
{/await}
