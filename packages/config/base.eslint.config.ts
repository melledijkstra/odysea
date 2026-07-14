import js from '@eslint/js'
import { globalIgnores, defineConfig } from 'eslint/config'
import ts from 'typescript-eslint'
import globals from 'globals'
import json from '@eslint/json'
import css from '@eslint/css'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/.dist/**',
    '**/coverage/**',
    '**/public/**',
    '**/storybook-static/**',
    '**/.turbo/**',
  ]),
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    ...js.configs.recommended,
  },
  ...ts.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
  })),
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    ...stylistic.configs.recommended,
  },
  // JSON and CSS configurations
  {
    files: ['**/*.json'],
    ignores: ['**/package.json', '**/tsconfig.json', '**/tsconfig.*.json'],
    plugins: { json },
    language: 'json/json',
  },
  {
    files: ['**/*.jsonc', '**/tsconfig.json', '**/tsconfig.*.json'],
    plugins: { json },
    language: 'json/jsonc',
  },
  {
    files: ['**/*.css'],
    ignores: ['**/app.css'],
    plugins: { css },
    language: 'css/css',
  },
])
