<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import PopPanel from '@/svelte/PopPanel.svelte'
  import { Popover } from 'bits-ui'
  import IconButton from '@/svelte/IconButton.svelte'
  import Toggle from '@/svelte/Toggle.svelte'
  import { mdiInformation, mdiCog } from '@mdi/js'
  import Button from '@/svelte/Button.svelte'
  import BitsUiPop from './BitsUiPop.svelte'

  const { Story } = defineMeta({
    title: 'Atoms/PopPanel',
    component: PopPanel,
  })
</script>

<Story name="Default">
  {#snippet template()}
    <Popover.Root>
      <Popover.Trigger>
        {#snippet child({ props })}
          <IconButton
            {...props}
            icon={mdiInformation}
            aria-label="Open panel"
          />
        {/snippet}
      </Popover.Trigger>
      <PopPanel>
        <div class="flex flex-col gap-3">
          <h2 class="text-sm font-bold">Quick Info</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            This is a PopPanel — a floating frosted-glass panel anchored to a
            trigger. It fades in and out.
          </p>
        </div>
      </PopPanel>
    </Popover.Root>
  {/snippet}
</Story>

<Story name="Small" args={{ panelProps: { size: 'small' } }}>
  {#snippet template()}
    <Popover.Root>
      <Popover.Trigger>
        {#snippet child({ props })}
          <IconButton {...props} icon={mdiCog} aria-label="Open panel" />
        {/snippet}
      </Popover.Trigger>
      <PopPanel panelProps={{ size: 'small' }}>
        <div class="flex flex-col gap-3">
          <h2 class="text-sm font-bold">Settings</h2>
          <Toggle label="Enable notifications" checked={false} />
          <Toggle label="Dark mode" checked={true} />
        </div>
      </PopPanel>
    </Popover.Root>
  {/snippet}
</Story>

<Story name="Large">
  {#snippet template()}
    <Popover.Root>
      <Popover.Trigger>
        {#snippet child({ props })}
          <Button {...props}>Open large panel</Button>
        {/snippet}
      </Popover.Trigger>
      <PopPanel panelProps={{ size: 'large' }}>
        <div class="flex flex-col gap-4">
          <h2 class="text-lg font-bold">Large Panel</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            This story demonstrates the large size variant. Notice the smooth
            fade-in when the panel appears, and the fade-out when it closes.
          </p>
          <div class="grid grid-cols-2 gap-2">
            {#each [1, 2, 3, 4, 5, 6] as n (n)}
              <div class="rounded-lg bg-white/20 dark:bg-white/10 p-3 text-xs">
                Item {n}
              </div>
            {/each}
          </div>
        </div>
      </PopPanel>
    </Popover.Root>
  {/snippet}
</Story>

<Story name="Bits UI">
  {#snippet template()}
    <BitsUiPop />
  {/snippet}
</Story>
