import { defineConfig } from 'tsdown'
import baseConfig from '@melledijkstra/config/tsdown/base.ts'

export default defineConfig({
  ...baseConfig,
  entry: {
    index: 'src/index.ts',
    testing: 'src/testing.ts',
  },
})
