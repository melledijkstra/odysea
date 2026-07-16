<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import AuthButton from '@/components/AuthButton.svelte'

  const { Story } = defineMeta({
    title: 'Atoms/Buttons/Auth',
    component: AuthButton,
    argTypes: {
      children: {
        control: {
          type: 'text',
        },
      },
      provider: {
        control: {
          type: 'select',
          options: ['google', 'github', 'fitbit'],
        },
      },
    },
  })
</script>

<Story name="Google" args={{ provider: 'google' }} />

<Story name="Fitbit" args={{ provider: 'fitbit' }} />

<Story name="Spotify" args={{ provider: 'spotify' }} />

<Story name="Google (disabled)" args={{ provider: 'google', disabled: true }} />
<Story name="Fitbit (disabled)" args={{ provider: 'fitbit', disabled: true }} />
<Story name="Spotify (disabled)" args={{ provider: 'spotify', disabled: true }} />
