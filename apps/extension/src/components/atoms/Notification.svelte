<script lang="ts">
  import { fade } from 'svelte/transition'
  import type { Notification } from '@/stores/notifications.svelte'
  import Icon from './Icon.svelte'
  import {
    mdiCheckCircleOutline,
    mdiClose,
    mdiCloseCircleOutline,
    mdiInformationOutline,
  } from '@mdi/js'

  type NotiticationProps = Notification & {
    onDismiss?: () => void
  }

  const { message, type, title, icon, onDismiss, duration }: NotiticationProps = $props()

  const finalIcon = $derived.by(() => {
    if (icon) return icon
    if (type === 'success') return mdiCheckCircleOutline
    if (type === 'error') return mdiCloseCircleOutline
    return mdiInformationOutline
  })
</script>

<div
  transition:fade
  role="alert"
  class="relative rounded-md border border-gray-300 bg-white p-4 shadow-sm max-w-md dark:border-gray-600 dark:bg-gray-800"
>
  <div class="flex items-start gap-4">
    <Icon
      path={finalIcon}
      size={24}
      class={type === 'success'
        ? 'text-green-600'
        : type === 'error'
          ? 'text-red-600'
          : 'text-blue-600'}
    />
    <div class="flex-1">
      {#if title}
        <strong class="font-medium text-gray-900 dark:text-white">{title}</strong>
      {/if}
      <p class="mt-0.5 text-sm text-gray-700 dark:text-gray-200 break-words">{message}</p>
    </div>

    <button
      class={[
        '-m-3 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer',
        'dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200',
      ]}
      type="button"
      aria-label="Dismiss notification"
      onclick={onDismiss}
    >
      <span class="sr-only">Dismiss popup</span>
      <Icon path={mdiClose} size={24} />
    </button>

    {#if duration}
      <hr class={[
        'h-1 duration-indicator border-none p-0 m-0 outline-none',
        'absolute bottom-0 left-0',
        type === 'success'
          ? 'bg-green-600'
          : type === 'error' ? 'bg-red-600' : 'bg-blue-600',
      ]} style="--progress-duration: {duration}ms" />
    {/if}
  </div>
</div>

<style lang="postcss">
  @reference '../../app.css';

  .duration-indicator {
    animation: progress var(--progress-duration, 3000ms) linear forwards;
  }
</style>
