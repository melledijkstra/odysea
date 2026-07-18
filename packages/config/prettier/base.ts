import type { Config } from 'prettier'

export default {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  plugins: ['prettier-plugin-tailwindcss', 'prettier-plugin-svelte'],
} as Config
