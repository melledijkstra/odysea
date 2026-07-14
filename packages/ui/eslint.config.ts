/// <reference types="node" />
import { defineConfig } from 'eslint/config'
import baseConfig from '@melledijkstra/config/base.eslint.config.ts'
import svelteConfig from '@melledijkstra/config/svelte.eslint.config.ts'

export default defineConfig([
  ...baseConfig,
  ...svelteConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
