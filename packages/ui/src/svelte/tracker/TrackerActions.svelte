<script lang="ts">
  let { children } = $props()
</script>

<div
  class={[
    'absolute flex flex-row opacity-0 transition-opacity items-center justify-center gap-1',
    'group-hover/tracker:opacity-100',
  ]}
>
  {@render children()}
</div>
