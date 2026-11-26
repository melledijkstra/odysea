export type StorybookBackgroundOption = {
  name: string
  value: string
}

export type StorybookPreviewConfig = {
  parameters: {
    backgrounds: {
      options: Record<string, StorybookBackgroundOption>
    }
    controls: {
      matchers: {
        color: RegExp
        date: RegExp
      }
    }
    actions: {
      argTypesRegex: string
    }
  }
  initialGlobals: {
    backgrounds: {
      grid: boolean
      value: string
    }
  }
}

const preview: StorybookPreviewConfig = {
  parameters: {
    backgrounds: {
      options: {
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
