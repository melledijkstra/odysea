<script lang="ts">
  import type { OauthProvider } from '@/oauth2/providers'
  import Button from '@melledijkstra/ui/svelte/Button.svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import IconGoogle from '@/icons/IconGoogle.svelte'
  import IconSpotify from '@/icons/IconSpotify.svelte'
  import IconGithub from '@/icons/IconGithub.svelte'

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const classes: Record<OauthProvider, string | string[]> = {
    google: [
      'bg-google hover:bg-google/80 focus:ring-4 focus:outline-hidden focus:ring-google/50 dark:focus:ring-google/55',
    ],
    spotify: [
      'bg-spotify hover:bg-spotify/80 focus:ring-4 focus:outline-hidden focus:ring-spotify/50 dark:focus:ring-spotify/55',
    ],
    github: [
      'bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-hidden focus:ring-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700',
    ],
  }

  const {
    provider,
    authenticated = false,
    children,
    ...props
  }: {
    provider: OauthProvider
    authenticated?: boolean
  } & HTMLButtonAttributes = $props()
</script>

<Button
  {...props}
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
  {/if}
  {#if children}
    {@render children()}
  {:else}
    {authenticated ? `Revoke Connection` : `Sign in with ${capitalize(provider)}`}
  {/if}
</Button>
