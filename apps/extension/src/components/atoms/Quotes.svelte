<script lang="ts">
  import { addNotification } from '@/stores/notifications.svelte'

  type Quote = {
    text: string
    author: string
  }

const quotes: Quote[] = [
  {
    text: '(Example) The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
  },
  {
    text: '(Example) The best way to predict the future is to invent it.',
    author: 'Alan Kay',
  },
] as const

const randomQuote = $derived(quotes[Math.floor(Math.random() * quotes.length)])
</script>

<div class="group relative text-center">
  <button onclick={async () => {
    const copyText = `${randomQuote.text} - ${randomQuote.author}`
    await navigator.clipboard.writeText(copyText)
    addNotification('Copied to clipboard!', 'success')
  }} class="cursor-pointer">
    <em class={[
      'inline-block text-lg text-white/50 group-hover:text-white',
      'transition-all duration-300 ease-in will-change-transform whitespace-nowrap',
      'translate-y-0 group-hover:-translate-y-1/2',
    ]}>"{randomQuote.text}"</em>
    <p class={[
      'inline-block text-sm text-gray-200',
      'transition-all duration-300 ease-in will-change-transform whitespace-nowrap',
      'translate-y-0 group-hover:translate-y-1/2',
      'opacity-0 group-hover:opacity-100',
      'absolute left-0 right-0',
    ]}>{randomQuote.author}</p>
  </button>
</div>
