<script lang="ts">
  import type { HTMLSelectAttributes, HTMLLabelAttributes } from 'svelte/elements'

  export type SelectOption = {
    value: string
    label: string
  }

  type SelectProps = {
    options?: Array<SelectOption>
    placeholder?: string
    value?: string
    label?: string | null
    labelProps?: HTMLLabelAttributes
  } & HTMLSelectAttributes

  let {
    value = $bindable<string>(),
    placeholder,
    label = null,
    ...props
  }: SelectProps = $props()
</script>

{#if label}
  <label
    for={props?.id}
    class="mb-2 text-sm font-medium text-gray-900 dark:text-white"
  >{label}</label>
{/if}
<select
  bind:value
  {...props}
  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
>
  {#if placeholder}
    <option value="" disabled selected>{placeholder}</option>
  {/if}
  {#each props.options || [] as option (option.value)}
    <option value={option.value}>{option.label}</option>
  {/each}
</select>
