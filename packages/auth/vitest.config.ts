import { defineProject, mergeConfig } from 'vitest/config'
import baseConfig from '@melledijkstra/config/vitest/base.ts'

export default mergeConfig(baseConfig, defineProject({}))
