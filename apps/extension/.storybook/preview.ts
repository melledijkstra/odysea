import type { Preview } from '@storybook/svelte'
import '../src/app.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        // 👇 Default options
        dark: { name: 'Dark', value: '#333' },
        light: { name: 'Light', value: '#F7F9F2' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    actions: {
      argTypesRegex: '^on.*',
    },
  },
  initialGlobals: {
    backgrounds: {
      grid: true,
      value: 'dark',
    },
  },
}

export default preview
