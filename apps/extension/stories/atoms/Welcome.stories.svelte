<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Welcome from '@/components/Welcome.svelte'
  import type { User } from '@/app-state.svelte'

  const user: User = $state({
    name: 'John Doe'
  });

  const { Story } = defineMeta({
    title: 'Atoms/Welcome',
    component: Welcome,
    args: {
      user,
      onUsernameChange: (name: string) => {
        user.name = name
      },
      onClearUsername: () => {
        user.name = ''
      }
    }
  })
</script>

<Story name="Default" />

<Story name="Without username" args={{ user: undefined }} />
