import { loadEnv } from 'vite'
import { defineConfig, defineProject } from 'vitest/config'
import type { PluginOption } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import packageJson from './package.json' with { type: 'json' }
import path from 'node:path'

const ENABLE_DEBUG = process.env.NODE_ENV === 'development'

function manifestTransformer(content: string, mode: string) {
  const envVars = loadEnv(mode, process.cwd())
  content = content.replace('%CLIENT_ID%', envVars.VITE_GOOGLE_CLIENT_ID)
  content = content.replace('%VERSION%', packageJson.version)
  return content
}

const determinePlugins = (mode: string): PluginOption[] => {
  const plugins: PluginOption[] = [
    tailwindcss(),
    svelte(),
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.json',
          dest: '.',
          transform: (content) => manifestTransformer(content, mode),
        },
      ],
    }),
  ]

  if (process.env.ANALYZE === 'true') {
    plugins.push(
      analyzer({
        openAnalyzer: true,
      })
    )
  }

  return plugins
}

const defaultConfig = defineConfig(({ mode }) => ({
  plugins: determinePlugins(mode),
  build: {
    minify: mode === 'production',
    rollupOptions: {
      input: {
        home: './index.html',
        options: './options.html',
        background: './src/background.entry.ts',
        popup: './popup.html',
        ...(ENABLE_DEBUG
          ? {
              debug: './debug.html',
            }
          : {}),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'scripts/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '/src'),
    },
  },
  ...defineProject({
    test: {
      environment: 'jsdom',
      setupFiles: ['./test-setup.ts'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
    },
  }),
}))

export default defaultConfig
