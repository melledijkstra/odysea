import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    pool: 'vmThreads',
    coverage: {
      provider: 'v8',
      exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    },
  },
})
