import { defineConfig } from 'tsdown'
import baseConfig from '@melledijkstra/config/tsdown/base.ts'

export default defineConfig({
  ...baseConfig,
  // Bundle arctic instead of treating it as external
  noExternal: ['arctic'],
})
