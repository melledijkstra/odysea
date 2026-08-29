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
  import { Logger } from '@/logger'
  import type { AuthClient } from '@melledijkstra/auth'
  import { getAuthContext } from '@/oauth2/auth.state.svelte'
  import Card from '@melledijkstra/ui/svelte/Card.svelte'
  import { scopeRegistry } from '@/oauth2/scope-registry'
  import Toggle from '@melledijkstra/ui/svelte/Toggle.svelte'
  import { clearAccountCache } from '@/queries/account'
  import { queryClient } from '@/queryClient'

  let isAuthenticating = $state(false)
  let authenticatingScope = $state<string | null>(null)

  const logger = new Logger('AuthenticationTab')

  const clients: Record<OauthProvider, AuthClient> = {
    google: googleAuthClient,
    spotify: spotifyAuthClient,
    github: githubAuthClient,
    'google-health': googleHealthAuthClient,
  } as const

  const authState = getAuthContext()

  const loadAuthState = authState.initialize()

  async function authenticate(provider: OauthProvider) {
    logger.log('Authenticating with', provider)
    isAuthenticating = true
    try {
      const authToken = await clients[provider].getAuthToken(true)
      const scopes = await clients[provider].getGrantedScopes()
      logger.log(
        'Authenticated with',
        provider,
        'token:',
        authToken,
        'scopes:',
        scopes
      )
      authState.update(provider, !!authToken, scopes)
    } catch (e) {
      logger.error('Failed to authenticate with', provider, e)
    } finally {
      isAuthenticating = false
    }
  }

  async function deauthenticate(provider: OauthProvider) {
    logger.log('Deauthenticating from', provider)
    await clients[provider].revokeToken()
    authState.deauthenticated(provider)
    if (provider === 'google') {
      await clearAccountCache()
      queryClient.removeQueries({ queryKey: ['account', 'google'] })
    }
  }

  async function authenticateScope(scopeKey: string, scopes: string[]) {
    isAuthenticating = true
    authenticatingScope = scopeKey
    try {
      const success = await googleAuthClient.getAuthToken(true, scopes)
      if (success) {
        const grantedScopes = await googleAuthClient.getGrantedScopes()
        authState.update('google', true, grantedScopes)
      }
    } catch (e) {
      logger.error('Failed to authenticate scopes', e)
    } finally {
      isAuthenticating = false
      authenticatingScope = null
    }
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
            checked={isAuthenticating || providerState.isAuthenticated}
            disabled={isAuthenticating}
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
              disabled={isAuthenticating}
              class={[
                'size-10 p-1 rounded transition-colors hover:bg-gray-200/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center',
              ]}
              onclick={() =>
                !hasScopes && authenticateScope(scopeKey, scope.scopes)}
            >
              {#if authenticatingScope === scopeKey}
                <Spinner class="size-6 text-gray-400" />
              {:else}
                <img
                  src={scope.icon}
                  alt={scopeKey}
                  class={[!hasScopes && 'grayscale']}
                />
              {/if}
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
