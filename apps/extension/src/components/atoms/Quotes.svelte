<script lang="ts">
  import { quotesState } from '@/modules/quotes/quotes.state.svelte'
  import { addNotification } from '@/stores/notifications.svelte'
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import { mdiRefresh } from '@mdi/js'

  $effect(() => {
    quotesState.fetchQuotes()
  })

  async function copyQuote() {
    const quote = quotesState.currentQuote
    const copyText = `${quote.quote} - ${quote.author}`
    await navigator.clipboard.writeText(copyText)
    addNotification('Copied to clipboard!', 'success')
  }
</script>

<div
  class={[
    'group relative flex items-center justify-center gap-2 text-center max-w-xl md:max-w-2xl mx-auto px-4',
    !quotesState.hasCustomQuotes && quotesState.loading
      ? 'opacity-0 pointer-events-none'
      : 'opacity-100',
    'transition-opacity duration-300 ease-in-out',
  ]}
>
  <button
    onclick={copyQuote}
    class={[
      'cursor-pointer flex flex-col items-center justify-center min-w-0 text-center',
      'focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden rounded-sm',
    ]}
    title="Click to copy quote"
  >
    <em
      class={[
        'text-base text-white/50 group-hover:text-white',
        'transition-colors duration-300 ease-in-out',
        'text-balance leading-relaxed wrap-break-word',
      ]}
    >
      "{quotesState.currentQuote.quote}"
    </em>

    <div
      class={[
        'grid grid-rows-[0fr] group-hover:grid-rows-[1fr]',
        'transition-[grid-template-rows] duration-300 ease-in-out',
        'w-full',
      ]}
    >
      <div class="overflow-hidden">
        <p
          class={[
            'text-sm text-gray-300 pt-1.5 wrap-break-word',
            'transition-opacity duration-300 ease-in-out',
            'opacity-0 group-hover:opacity-100',
          ]}
        >
          {quotesState.currentQuote.author}
        </p>
      </div>
    </div>
  </button>

  {#if quotesState.quotes.length > 1}
    <button
      onclick={(e) => {
        e.stopPropagation()
        quotesState.nextQuote()
      }}
      title="Next quote"
      class="opacity-0 group-hover:opacity-60 hover:opacity-100! text-white/70 hover:text-white transition-opacity duration-200 cursor-pointer p-1 rounded-full hover:bg-white/10 shrink-0 self-center"
      aria-label="Next quote"
    >
      <Icon path={mdiRefresh} size={16} />
    </button>
  {/if}
</div>
