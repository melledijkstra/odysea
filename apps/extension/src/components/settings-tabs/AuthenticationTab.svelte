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
  import { getAuthContext } from '@/oauth2/auth.state.svelte'
  import Card from '@melledijkstra/ui/svelte/Card.svelte'
  import { scopeRegistry } from '@/oauth2/scope-registry'
  import Toggle from '@melledijkstra/ui/svelte/Toggle.svelte'

  const logger = new Logger('AuthenticationTab')

  const clients: Record<OauthProvider, AuthClient> = {
    google: googleAuthClient,
    spotify: spotifyAuthClient,
    github: githubAuthClient,
    'google-health': googleHealthAuthClient,
  } as const

  const authState = getAuthContext()

  function handleStorageChange(
    changes: Record<string, browser.Storage.StorageChange>
  ) {
    for (const key of Object.keys(clients)) {
      const provider = key as OauthProvider
      const storageKey = clients[provider].storageKey
      if (changes[storageKey]) {
        authState.update(provider, !!changes[storageKey].newValue, [])
        if (authState.providers[provider].isAuthenticated) {
          clients[provider].getGrantedScopes().then((scopes) => {
            authState.update(provider, true, scopes)
          })
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
    for (const key of Object.keys(authState.providers)) {
      const provider = key as OauthProvider
      const isAuthenticated = await clients[provider].isAuthenticated()
      if (isAuthenticated) {
        const scopes = await clients[provider].getGrantedScopes()
        authState.update(provider, true, scopes)
      } else {
        authState.deauthenticated(provider)
      }
    }
  }

  const loadAuthState = retrieveAuthState()

  async function authenticate(provider: OauthProvider) {
    logger.log('Authenticating with', provider)
    const authToken = await clients[provider].getAuthToken(true)
    const scopes = await clients[provider].getGrantedScopes()
    authState.update(provider, !!authToken, scopes)
  }

  async function deauthenticate(provider: OauthProvider) {
    logger.log('Deauthenticating from', provider)
    await clients[provider].deauthenticate()
    authState.deauthenticated(provider)
  }

  $inspect(authState.providers['google'].scopes)
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
{#await loadAuthState}
  <div class="flex p-4">
    <Spinner class="text-gray-400" />
  </div>
{:then}
  {#each Object.keys(clients) as key (key)}
    {@const provider = key as OauthProvider}
    {@const providerState = authState.providers[provider]}

    {#if provider === 'google'}
      <Card variant="auto">
        <div class="flex flex-row justify-between">
          <h2 class="text-lg">Google</h2>
          <Toggle
            bind:checked={providerState.isAuthenticated}
            onclick={() =>
              providerState.isAuthenticated
                ? deauthenticate(provider)
                : authenticate(provider)}
          />
        </div>
        <div class="flex flex-row gap-3 my-2">
          <!-- TODO: allow IconButton to provide custom icons, not just mdi -->
          <!-- <IconButton icon={mdiListBox} /> -->
          {#each Object.keys(scopeRegistry) as scopeKey (scopeKey)}
            {@const key = scopeKey as keyof typeof scopeRegistry}
            {@const scope = scopeRegistry[key]}
            {@const hasScopes =
              authState.providers.google.isAuthenticated &&
              authState.hasScopes(provider, scope.scopes)}
            <button
              title={scope.scopes.join(', ')}
              class={[
                'size-10 p-1 rounded transition-colors hover:bg-gray-200/20 cursor-pointer',
              ]}
              onclick={() => googleAuthClient.authenticate(scope.scopes)}
            >
              <img
                src={scope.icon}
                alt={scopeKey}
                class={[!hasScopes && 'grayscale']}
              />
            </button>
          {/each}
        </div>
      </Card>
    {:else}
      <AuthButton
        title={providerState.scopes.length > 0
          ? `Granted scopes: ${providerState.scopes.join(', ')}`
          : 'No scopes granted'}
        class="w-full mt-4"
        authenticated={providerState.isAuthenticated}
        {provider}
        onclick={() =>
          providerState.isAuthenticated
            ? deauthenticate(provider)
            : authenticate(provider)}
      />
    {/if}
  {/each}
{/await}
