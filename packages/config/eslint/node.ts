import { defineConfig } from 'eslint/config'
import baseConfig from './base.ts'
import globals from 'globals'

export default defineConfig([
  ...baseConfig,
  {
    name: 'Node.js Configuration',
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
