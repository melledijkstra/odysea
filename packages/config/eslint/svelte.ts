import { defineConfig } from 'eslint/config'
import svelte from 'eslint-plugin-svelte'
import svelteParser from 'svelte-eslint-parser'
import tsParser from '@typescript-eslint/parser'

export default defineConfig([
  svelte.configs.recommended,
  // Svelte Configuration
  // config docs:
  // https://github.com/sveltejs/svelte-eslint-parser
  {
    name: 'Svelte Parser Configuration',
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
        parser: {
          ts: tsParser,
        }
      },
    },
  },
])
