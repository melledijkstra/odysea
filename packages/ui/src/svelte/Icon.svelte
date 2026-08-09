<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  export type IconProps = {
    path: string
    class?: string
    size?: number | string
    viewbox?: `${number} ${number} ${number} ${number}`
    flip?: string
    rotate?: number
  } & HTMLAttributes<SVGElement>

  const {
    path,
    size,
    viewbox,
    flip = 'none',
    rotate = 0,
    ...props
  }: IconProps = $props()

  const sizeValue = $derived(size ?? 20)
  const viewboxValue = $derived(viewbox ?? '0 0 24 24')
  const sx = $derived(['both', 'horizontal'].includes(flip) ? '-1' : '1')
  const sy = $derived(['both', 'vertical'].includes(flip) ? '-1' : '1')
  const r = $derived(isNaN(rotate as number) ? rotate : rotate + 'deg')
</script>

<svg
  width={sizeValue}
  height={sizeValue}
  viewBox={viewboxValue}
  style="--sx: {sx}; --sy: {sy}; --r: {r}"
  {...props}
>
  <path d={path} />
</svg>

<style>
  svg {
    transform: rotate(var(--r, 0deg)) scale(var(--sx, 1), var(--sy, 1));
  }

  path {
    fill: currentColor;
  }
</style>
