import { defineConfig } from 'tsdown'
import { visualizer, type BundlerOutputOptions } from 'rollup-plugin-visualizer'

const plugins = []

if (process.env.ANALYZE === 'true') {
  plugins.push(
    visualizer((outputOpts: BundlerOutputOptions & { format?: string }) => ({
      open: true,
      filename: `stats-${outputOpts.format ?? 'bundle'}.html`,
    }))
  )
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  fixedExtension: true,
  plugins,
})
