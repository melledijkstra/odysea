<script module lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  export type TrackerActionProps = {
    icon: string
    ariaLabel?: string
  } & HTMLAttributes<HTMLButtonElement>
</script>

<script lang="ts">
  import IconButton from '../IconButton.svelte'

  const { icon, ariaLabel, ...props }: TrackerActionProps = $props()
</script>

<IconButton
  {icon}
  size={16}
  aria-label={ariaLabel}
  class="hover:text-primary p-0.5 rounded-full flex items-center justify-center"
  {...props}
/>
