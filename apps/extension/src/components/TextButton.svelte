<script lang="ts">
  const { children, ...props } = $props()
</script>

<button
  {...props}
  class={[
    'text-slate-200 hover:text-white text-lg capitalize cursor-pointer',
    props.class,
  ]}
>
  {@render children()}
</button>
