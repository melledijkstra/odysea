import { defineProject, mergeConfig } from 'vitest/config'
import baseConfig from '@melledijkstra/config/vitest.base.config.ts'

export default mergeConfig(
  baseConfig,
  defineProject({
    test: {
      setupFiles: ['./test-setup.ts'],
    },
  }),
)
