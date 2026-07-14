/// <reference types="node" />
import { defineConfig } from 'eslint/config'
import baseConfig from './packages/config/base.eslint.config.ts'

export default defineConfig([
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
