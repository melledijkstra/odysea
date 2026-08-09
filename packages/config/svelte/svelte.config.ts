import type { SvelteConfig } from '@sveltejs/vite-plugin-svelte'

export default {
  compilerOptions: {
    // unfortunately `addon-svelte-csf` does not fully support runes yet
    // see: https://github.com/storybookjs/addon-svelte-csf/issues/337
    // keep disabled for now, but we should enable it once the issue is resolved
    // runes: true,
  },
} satisfies SvelteConfig
