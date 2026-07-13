import { defineConfig } from 'tsdown'
import { visualizer } from 'rollup-plugin-visualizer'

const plugins = []

if (process.env.ANALYZE === 'true') {
  plugins.push(visualizer(outputOpts => ({
    open: true,
    filename: `stats-${outputOpts.format}.html`,
  })))
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  plugins,
})
