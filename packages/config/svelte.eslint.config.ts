import { defineConfig } from 'eslint/config'
import svelte from 'eslint-plugin-svelte'
import svelteParser from 'svelte-eslint-parser'
import tsParser from '@typescript-eslint/parser'

export default defineConfig([
  ...svelte.configs.recommended.map(config => ({
    ...config,
    files: config.files ?? ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
  })),
  // Svelte Configuration
  {
    files: [
      '**/*.svelte',
      '*.svelte',
      '**/*.svelte.js',
      '*.svelte.js',
      '**/*.svelte.ts',
      '*.svelte.ts',
    ],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
      },
    },
    rules: {
      // Svelte 5 props destructured from $props() must not trigger prefer-const
      'prefer-const': 'off',
    },
  },
])
