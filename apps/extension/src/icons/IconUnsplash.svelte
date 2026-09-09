<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements'

  export type IconUnsplashProps = {
    size?: number | string
  } & SVGAttributes<SVGSVGElement>

  const { size = 16, class: className, ...props }: IconUnsplashProps = $props()
</script>

<svg
  class={['inline shrink-0 fill-current', className]}
  width={size}
  height={size}
  role="img"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  {...props}
>
  <title>Unsplash</title>
  <path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z" />
</svg>
