<script lang="ts">
  import type { OAuthProvider } from '@/oauth2/auth.state.svelte'
  import Button from '@melledijkstra/ui/svelte/Button.svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import IconGoogle from '@/icons/IconGoogle.svelte'
  import IconSpotify from '@/icons/IconSpotify.svelte'
  import IconGithub from '@/icons/IconGithub.svelte'

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const classes: Record<OAuthProvider, string | string[]> = {
    google: [
      'bg-google hover:bg-google/80 focus:ring-4 focus:outline-hidden focus:ring-google/50 dark:focus:ring-google/55',
    ],
    spotify: [
      'bg-spotify hover:bg-spotify/80 focus:ring-4 focus:outline-hidden focus:ring-spotify/50 dark:focus:ring-spotify/55',
    ],
    github: [
      'bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-hidden focus:ring-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700',
    ],
    'google-health': [
      'dark:bg-google-health dark:hover:bg-google-health/80 dark:focus:ring-zinc-600 dark:border-zinc-400',
    ],
  }

  const {
    provider,
    authenticated = false,
    isLoading = false,
    children,
    ...props
  }: {
    provider: OAuthProvider
    authenticated?: boolean
    isLoading?: boolean
  } & HTMLButtonAttributes = $props()
</script>

<Button
  {...props}
  disabled={isLoading || props.disabled}
  class={[
    'flex flex-row items-center justify-center gap-2',
    'disabled:bg-gray-400 disabled:focus:ring-gray-300 disabled:cursor-auto',
    classes[provider],
    props.class,
  ]}
>
  {#if provider === 'google'}
    <IconGoogle />
  {:else if provider === 'spotify'}
    <IconSpotify />
  {:else if provider === 'github'}
    <IconGithub />
  {:else if provider === 'google-health'}
    <img
      src="/icons/google-health.svg"
      class="w-[1em] h-[1em] inline"
      alt="Google Health"
    />
  {/if}
  {#if children}
    {@render children()}
  {:else}
    {isLoading
      ? `Connecting...`
      : authenticated
        ? `Revoke Connection`
        : `Sign in with ${capitalize(provider)}`}
  {/if}
</Button>
