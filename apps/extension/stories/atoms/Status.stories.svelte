<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Status from '@/components/atoms/Status.svelte'

  const { Story } = defineMeta({
    title: 'Atoms/Status',
    component: Status,
  })
</script>

<Story name="Default" />

<Story name="Pinging" args={{ pinging: true }} />

<Story name="Online" args={{ status: true }} />

<Story name="Offline" args={{ status: false }} />
