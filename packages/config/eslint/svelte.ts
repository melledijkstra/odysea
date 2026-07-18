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
        },
        // Automatically searches for the nearest tsconfig.json
        // !NOTICE: Set to false to disable type checked linting
        // which slows down significantly
        projectService: false,
        // orient from where the ESLint command is run, not where this config file is located
        tsconfigRootDir: process.cwd(),
        extraFileExtensions: ['.svelte'],
      },
    },
  },
])
