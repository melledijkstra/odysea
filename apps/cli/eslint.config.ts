/// <reference types="node" />
import { defineConfig } from 'eslint/config'
import baseConfig from '@melledijkstra/config/base.eslint.config.ts'

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
