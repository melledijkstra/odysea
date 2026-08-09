import type { StorybookConfig } from '@storybook/svelte-vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|svelte|mdx)'],
  addons: ['@storybook/addon-svelte-csf'],
  framework: '@storybook/svelte-vite',
  async viteFinal(config) {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/svelte': path.resolve(__dirname, '../src/svelte'),
      '@/react': path.resolve(__dirname, '../src/react'),
      '@': path.resolve(__dirname, '../src'),
    }
    return config
  },
}

export default config
