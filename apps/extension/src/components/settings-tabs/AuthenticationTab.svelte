<script lang="ts">
  import { settingsStore, settings } from '@/settings/index.svelte'
  import AuthButton from '@/components/AuthButton.svelte'
  import { type OauthProvider } from '@/oauth2/providers'
  import {
    googleAuthClient,
    spotifyAuthClient,
    githubAuthClient,
    googleHealthAuthClient,
  } from '@/oauth2/clients'
  import Input from '@melledijkstra/ui/svelte/Input.svelte'
  import Spinner from '@melledijkstra/ui/svelte/Spinner.svelte'
  import { onMount, onDestroy } from 'svelte'
  import browser from 'webextension-polyfill'
  import { Logger } from '@/logger'
  import type { AuthClient } from '@melledijkstra/extension'

  const logger = new Logger('AuthenticationTab')

  const clients: Record<OauthProvider, AuthClient> = {
    google: googleAuthClient,
    spotify: spotifyAuthClient,
    github: githubAuthClient,
    'google-health': googleHealthAuthClient,
  } as const

  const authState = $state({
    google: false,
    spotify: false,
    github: false,
    'google-health': false,
  })

  const grantedScopes = $state<Record<OauthProvider, string[]>>({
    google: [],
    spotify: [],
    github: [],
    'google-health': [],
  })

  function handleStorageChange(
    changes: Record<string, browser.Storage.StorageChange>
  ) {
    for (const key of Object.keys(clients)) {
      const provider = key as OauthProvider
      const storageKey = clients[provider].storageKey
      if (changes[storageKey]) {
        authState[provider] = !!changes[storageKey].newValue
        if (authState[provider]) {
          clients[provider].getGrantedScopes().then((scopes) => {
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

<h1 class="text-xl mb-3">Authentication Configurations</h1>
<div class="flex flex-col gap-3 mb-6">
  <Input
    label="OpenWeather API Key"
    bind:value={settingsStore.apiKeys.weather}
    onchange={() => settings.saveSettingsToStorage()}
  />
  <Input
    label="Google Client ID"
    bind:value={settingsStore.apiKeys.google_client_id}
    onchange={() => settings.saveSettingsToStorage()}
  />
  <Input
    label="Google Client Secret"
    bind:value={settingsStore.apiKeys.google_client_secret}
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

<h1 class="text-xl mb-3">Authentication Status</h1>
{#await retrieveAuthState()}
  <div class="flex p-4">
    <Spinner class="text-gray-400" />
  </div>
{:then}
  {#each Object.keys(clients) as key (key)}
    {@const provider = key as OauthProvider}
    <AuthButton
      title={grantedScopes[provider].length > 0
        ? `Granted scopes: ${grantedScopes[provider].join(', ')}`
        : 'No scopes granted'}
      class="w-full mt-4"
      authenticated={authState[provider]}
      {provider}
      onclick={() =>
        authState[provider] ? deauthenticate(provider) : authenticate(provider)}
    />
  {/each}
{/await}
