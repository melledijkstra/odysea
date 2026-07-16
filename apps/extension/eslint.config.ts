import { defineConfig, globalIgnores } from 'eslint/config'
import baseConfig from '@melledijkstra/config/eslint/base.ts'
import webConfig from '@melledijkstra/config/eslint/web.ts'
import svelteConfig from '@melledijkstra/config/eslint/svelte.ts'

export default defineConfig([
  ...baseConfig,
  ...webConfig,
  ...svelteConfig,
  globalIgnores([
    './public/spotify-sdk.min.js',
  ], 'Ignore minified Spotify SDK file'),
])
