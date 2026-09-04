<script lang="ts">
  import { getMomentOfDay, repeatEvery } from '@melledijkstra/toolbox'
  import { onPageVisible } from '@/utils/visibility'

  type WelcomeProps = {
    name?: string
    onUsernameChange?: (name: string) => void
    onClearUsername?: () => void
  }

  const { name, onUsernameChange, onClearUsername }: WelcomeProps = $props()

  const MINUTE = 60 * 1000

  let nameInput = $state('')
  let dayPart = $state(getMomentOfDay())

  const updateDayPart = () => {
    dayPart = getMomentOfDay()
  }

  $effect(() => {
    const cancelTimer = repeatEvery(updateDayPart, MINUTE)
    const cleanup = onPageVisible(updateDayPart)

    return () => {
      cancelTimer?.()
      cleanup?.()
    }
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
          onUsernameChange?.(nameInput)
        }
      }}
    />
    <span class="username-input inline-block invisible min-h-[1em]"
      >{nameInput.replace(/ /g, '\u00A0')}</span
    >
  </span>
{/snippet}

<h2
  class={[
    /* make sure to render some space when loading in the welcome message to avoid flickering */
    'text-white text-5xl antialiased empty:min-h-18 text-shadow-lg/30 leading-normal',
    // creates a shadow behind the text
    'relative before:absolute before:inset-[-0.05em] before:bg-black/10 before:blur-xl before:rounded-lg before:z-[-1]',
  ]}
>
  {#if name}
    <span>
      Good {dayPart},
      {#if onClearUsername}
        <button
          class="text-shadow-lg/30 cursor-pointer hover:line-through"
          onclick={() => onClearUsername?.()}
          title="Clear username"
          aria-label="Clear username"
        >
          {name}
        </button>
      {:else}
        <span class="text-shadow-lg/30">{name}</span>
      {/if}
    </span>
  {:else if onUsernameChange}
    {@render prompt()}
  {:else}
    <span>Good {dayPart}!</span>
  {/if}
</h2>

<style lang="postcss">
  @reference '../app.css';

  .username-input {
    @apply max-w-[min(100%,12em)] min-w-40 align-baseline leading-normal whitespace-nowrap outline-none text-shadow-lg/30;
  }
</style>
