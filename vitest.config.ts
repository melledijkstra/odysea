import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from './packages/config/vitest.base.config'

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      projects: ['apps/*', 'packages/*'],
    },
  }),
)
