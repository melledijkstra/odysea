import type { Config } from 'prettier'
import prettierConfig from '@melledijkstra/config/prettier/base.ts'

export default {
  ...prettierConfig,
  plugins: ['prettier-plugin-tailwindcss', 'prettier-plugin-svelte'],
} as Config
