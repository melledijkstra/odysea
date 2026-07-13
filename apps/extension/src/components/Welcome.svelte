<script lang="ts">
  import { getMomentOfDay } from "@/ui"
  import { repeatEvery } from "@melledijkstra/toolbox"
  import type { User } from "@/app-state.svelte"

  type WelcomeProps = {
    user: User
    onUsernameChange: (name: string) => void
    onClearUsername: () => void
  }

  const { user, onUsernameChange, onClearUsername }: WelcomeProps = $props()

  const MINUTE = 60 * 1000

  let nameInput = $state('')
  let dayPart = $state(getMomentOfDay())
  let cancelTimer = $state<() => void>()

  $effect(() => {
    cancelTimer = repeatEvery(() => {
      dayPart = getMomentOfDay()
    }, MINUTE)

    return () => cancelTimer?.()
  })
</script>

{#snippet prompt()}
  <span class="inline-block">What is your name?&nbsp;</span>
  <span class="inline p-2 -m-2 relative">
    <input
      class="username-input block border-white border-b-2 absolute p-2 top-0 left-0 right-0 bottom-0"
      name="username"
      type="text"
      spellcheck="false"
      autocomplete="username"
      bind:value={nameInput}
      onkeypress={(event) => {
        if (event.key === 'Enter' && nameInput) {
          onUsernameChange(nameInput)
        }
      }} />
      <span class="username-input inline-block invisible min-h-[1em]">{nameInput.replace(/ /g, '\u00A0')}</span>
  </span>
{/snippet}

<!-- make sure to render some space when loading in the welcome message to avoid flickering -->
<h2 class={[
  "text-white text-5xl antialiased empty:min-h-18 text-shadow-lg/30 leading-normal",
  // creates a shadow behind the text
  'relative before:absolute before:inset-[-0.05em] before:bg-black/10 before:blur-xl before:rounded-lg before:z-[-1]'
]}>
  {#if user?.name}
    <span>Good {dayPart}, <button class="cursor-pointer hover:line-through text-shadow-lg/30" onclick={onClearUsername}>{user.name}</button></span>
  {:else}
    {@render prompt()}
  {/if}
</h2>

<style lang="postcss">
  @reference '../app.css';

  .username-input {
    @apply min-w-[10rem] max-w-[min(100%,12em)] text-shadow-lg/30 whitespace-nowrap align-baseline outline-none leading-normal;
  }
</style>