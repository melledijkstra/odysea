<script lang="ts">
  import type {
    HTMLLabelAttributes,
    HTMLInputAttributes,
  } from 'svelte/elements'
  import Icon from './Icon.svelte'
  import { mdiClose } from '@mdi/js'

  let {
    tags = $bindable<string[]>([]),
    label = null,
    labelProps = {},
    ...props
  }: {
    tags?: string[]
    label?: string | null
    labelProps?: HTMLLabelAttributes
  } & HTMLInputAttributes = $props()

  let inputValue = $state('')

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      if (!tags.includes(inputValue.trim())) {
        tags = [...tags, inputValue.trim()]
      }
      inputValue = ''
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      tags = tags.slice(0, -1)
    }
    props.onkeydown?.(e)
  }

  function removeTag(index: number) {
    tags = tags.filter((_, i) => i !== index)
  }
</script>

{#if label}
  <label
    for={props?.id}
    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    {...labelProps}>{label}</label
  >
{/if}
<div
  class={[
    'flex flex-wrap items-center gap-1.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus-within:ring-blue-500 focus-within:border-blue-500 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus-within:ring-blue-500 dark:focus-within:border-blue-500',
    props.class,
  ]}
>
  {#each tags as tag, i (tag)}
    <span
      class="flex items-center gap-1 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-md text-xs font-medium"
    >
      {tag}
      <button
        type="button"
        class="hover:text-red-500 focus-visible:ring-2 focus-visible:ring-blue-500 rounded flex items-center justify-center"
        onclick={() => removeTag(i)}
        aria-label="Remove tag"
      >
        <Icon path={mdiClose} size={12} />
      </button>
    </span>
  {/each}
  <input
    {...props}
    type="text"
    class="flex-1 bg-transparent border-none outline-none p-0 min-w-20 text-sm focus:ring-0 dark:text-white"
    bind:value={inputValue}
    onkeydown={handleKeydown}
  />
</div>
