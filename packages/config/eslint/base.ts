import js from '@eslint/js'
import { globalIgnores, defineConfig } from 'eslint/config'
import ts from 'typescript-eslint'
// import json from '@eslint/json'
// import css from '@eslint/css'
import turboPlugin from 'eslint-plugin-turbo'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores([
    'dist/**',
    'node_modules/**',
    '.turbo/**',
    '.next/**',
    'coverage/**',
    'test_results/**',
    'storybook-static/**',
  ]),
  js.configs.recommended,
  ts.configs.recommended,
  eslintConfigPrettier,
  {
    name: 'TypeScript Project Configuration',
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        projectService: true, // Automatically searches for the nearest tsconfig.json
        // orient from where the ESLint command is run, not where this config file is located
        tsconfigRootDir: process.cwd(),
      },
    },
  },
  {
    name: 'Turbo Plugin Configuration',
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  // JSON and CSS configurations
  // {
  //   files: ['**/*.json'],
  //   ignores: ['**/package.json', '**/tsconfig.json', '**/tsconfig.*.json'],
  //   plugins: { json },
  //   language: 'json/json',
  // },
  // {
  //   files: ['**/*.jsonc', '**/tsconfig.json', '**/tsconfig.*.json'],
  //   plugins: { json },
  //   language: 'json/jsonc',
  // },
  // {
  //   files: ['**/*.css'],
  //   ignores: ['**/app.css'],
  //   plugins: { css },
  //   language: 'css/css',
  // },
])
