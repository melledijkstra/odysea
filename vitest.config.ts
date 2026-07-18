import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from '@melledijkstra/config/vitest/base.ts'

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      projects: ['apps/*', 'packages/*'],
    },
  })
)
