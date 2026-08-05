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
  import Input from '@/components/atoms/Input.svelte'
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

  function handleStorageChange(
    changes: Record<string, browser.Storage.StorageChange>
  ) {
    for (const key of Object.keys(clients)) {
      const provider = key as OauthProvider
      const storageKey = clients[provider].storageKey
      if (changes[storageKey]) {
        authState[provider] = !!changes[storageKey].newValue
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
    authState.google = await clients.google.isAuthenticated()
    authState.spotify = await clients.spotify.isAuthenticated()
    authState.github = await clients.github.isAuthenticated()
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
  <p class="text-base">Loading...</p>
{:then}
  <div class="flex flex-col gap-3">
    <p class="text-sm">
      <strong>Google:</strong>
      <span class="text-gray-400">{authState.google}</span>
      <AuthButton
        class="mt-2"
        authenticated={authState.google}
        provider="google"
        onclick={() =>
          authState.google ? deauthenticate('google') : authenticate('google')}
      />
    </p>
    <p class="text-sm">
      <strong>Spotify:</strong>
      <span class="text-gray-400">{authState.spotify}</span>
      <AuthButton
        class="mt-2"
        authenticated={authState.spotify}
        provider="spotify"
        onclick={() =>
          authState.spotify
            ? deauthenticate('spotify')
            : authenticate('spotify')}
      />
    </p>
    <p class="text-sm">
      <strong>GitHub:</strong>
      <span class="text-gray-400">{authState.github}</span>
      <AuthButton
        class="mt-2"
        authenticated={authState.github}
        provider="github"
        onclick={() =>
          authState.github ? deauthenticate('github') : authenticate('github')}
      />
    </p>
  </div>
{/await}
