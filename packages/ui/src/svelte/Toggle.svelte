<script lang="ts">
  import type { ClassValue, HTMLInputAttributes } from 'svelte/elements'

  export type ToggleSize = 'small' | 'medium' | 'large'

  export type ToggleProps = {
    checked: boolean
    toggleSize?: ToggleSize
    label?: string
    parentClass?: string
  } & HTMLInputAttributes

  let {
    checked = $bindable(),
    toggleSize = 'medium',
    label,
    parentClass = '',
    ...props
  }: ToggleProps = $props()

  let sizeClasses: ClassValue = $derived(
    {
      small: [
        'w-7 h-4 after:h-3 after:w-3 peer-focus:ring-1',
        'after:top-0.5 after:inset-s-0.5',
      ],
      medium: [
        'w-11 h-6 after:h-5 after:w-5 peer-focus:ring-2',
        'after:top-0.5 after:inset-s-0.5',
      ],
      large: [
        'w-15 h-8 after:h-7 after:w-7 peer-focus:ring-3',
        'after:top-0.5 after:inset-s-0.5',
      ],
    }[toggleSize]
  )
</script>

<label class={['inline-flex items-center cursor-pointer', parentClass]}>
  <input type="checkbox" class="sr-only peer" name="" {...props} bind:checked />
  <div
    class={[
      sizeClasses,
      'relative rounded-full dark:border-gray-600',
      // background
      'bg-gray-200 dark:bg-gray-700',
      // ring
      'peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800',
      // after
      "after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full after:transition-all",
      // peer
      'peer-focus:outline-hidden',
      // animation
      'peer-checked:after:translate-x-full peer-checked:rtl:after:-translate-x-full',
      'peer-checked:after:border-white peer-checked:bg-blue-600 peer-disabled:bg-gray-500 dark:peer-disabled:bg-gray-500 dark:peer-checked:bg-blue-600',
      'shrink-0',
    ]}
  ></div>
  {#if label}
    <span class="ml-3 ms-3 text-sm font-medium text-gray-900 dark:text-gray-300"
      >{label}</span
    >
  {/if}
</label>
