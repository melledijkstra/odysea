import js from '@eslint/js'
import { globalIgnores, defineConfig } from 'eslint/config'
import ts from 'typescript-eslint'
import turboPlugin from 'eslint-plugin-turbo'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores([
    'dist/**',
    'node_modules/**',
    '.turbo/**',
    '.next/**',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
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
])
