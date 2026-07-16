<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Notification from '@/components/atoms/Notification.svelte'
  import type { Notification as NotificationType } from '@/stores/notifications.svelte'
  import { mdiWifiOff } from '@mdi/js'

  const notification: NotificationType = {
    id: '1',
    message: 'This is a notification',
    type: 'info',
  }

  const { Story } = defineMeta({
    title: 'Atoms/Notifications',
    component: Notification,
    args: {
      ...notification,
    },
  })
</script>

<Story name="Default" args={{ ...notification }} />

<Story name="Success" args={{ message: 'Succesfully added a new task', type: 'success' }} />

<Story name="Error" args={{ message: 'An error occurred while adding a new task', type: 'error' }} />

<Story name="Title" args={{ title: 'Notification Title 🎉' }} />

<Story name="Without Message" args={{ title: 'This is the title of the notification', type: 'info', message: undefined }} />

<Story name="Custom Icon" args={{
  title: 'You are offline',
  message: 'Please check your internet connection and try again.',
  type: 'error',
  icon: mdiWifiOff,
}} />

<Story name="Long Title and Message" args={{
  title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
}} />

<Story name="With duration (info)" args={{
  duration: 3000,
  message: 'This notification will disappear in 3 seconds',
}} />

<Story name="With duration (success)" args={{
  duration: 5000,
  type: 'success',
  message: 'This notification will disappear in 5 seconds',
}} />
