<script lang="ts">
  import { notifications, removeNotification } from '@/stores/notifications.svelte'
  import Notification from './atoms/Notification.svelte'

  const { position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' } = $props()
</script>

<div
  class={[
    position.includes('top') && 'top-4',
    position.includes('bottom') && 'bottom-4',
    position.includes('right') && 'right-4',
    position.includes('left') && 'left-4',
    'flex flex-col gap-1 fixed z-50',
  ]}
>
  {#each notifications as notification (notification.id)}
    <Notification {...notification} onDismiss={() => removeNotification(notification.id)} />
  {/each}
</div>
