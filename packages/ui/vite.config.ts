import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@/svelte': path.resolve(import.meta.dirname, '../src/svelte'),
      '@/react': path.resolve(import.meta.dirname, '../src/react'),
    },
  },
})
