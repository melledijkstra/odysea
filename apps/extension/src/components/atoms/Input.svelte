<script lang="ts">
  import type { HTMLLabelAttributes, HTMLInputAttributes } from 'svelte/elements'

  let { value = $bindable<string | number>(), label = null, labelProps = {}, ...props }: {
    value?: string | number
    label?: string | null
    labelProps?: HTMLLabelAttributes
  } & HTMLInputAttributes = $props()
</script>

{#if label}
  <label for={props?.id} class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" {...labelProps}>{label}</label>
{/if}
<input
  {...props}
  class={[
    'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
    props.class,
  ]}
  bind:value
/>
