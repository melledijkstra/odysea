import { defineConfig } from 'eslint/config'
import baseConfig from '@melledijkstra/config/eslint/base.ts'

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
