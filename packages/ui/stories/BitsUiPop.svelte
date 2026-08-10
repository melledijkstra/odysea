<script lang="ts">
  import { Popover, Separator } from 'bits-ui'

  let width = $state(1024)
  let height = $state(768)
</script>

<Popover.Root>
  <Popover.Trigger
    class="rounded-input bg-dark
	text-background shadow-mini hover:bg-dark/95 inline-flex h-10 select-none items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-medium transition-all hover:cursor-pointer active:scale-[0.98]"
  >
    Resize
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content
      class={[
        'border-dark-10 bg-background shadow-popover',
        'animate-duration-200 data-[state=open]:animate-zoom-in data-[state=closed]:animate-zoom-out data-[side=bottom]:animate-slide-in-2 data-[side=left]:animate-slide-in-right-2 data-[side=right]:animate-slide-in-left-2 data-[side=top]:animate-slide-in-bottom-2 origin-(--bits-popover-content-transform-origin)',
        'z-30 w-full max-w-[328px] rounded-[12px] border p-4',
      ]}
      sideOffset={8}
    >
      <div class="flex items-center">
        <div class="flex flex-col">
          <h4 class="text-[17px] font-semibold leading-5 tracking-[-0.01em]">
            Resize image
          </h4>
          <p class="text-muted-foreground text-sm font-medium">
            Resize your photos easily
          </p>
        </div>
      </div>
      <Separator.Root class="bg-dark-10 -mx-4 mb-6 mt-[17px] block h-px" />
      <div class="flex items-center pb-2">
        <div class="mr-2 flex items-center">
          <div class="relative mr-2">
            <span class="sr-only">Width</span>
            <span
              aria-hidden="true"
              class="text-xxs text-muted-foreground absolute left-5 top-4"
              >W</span
            >
            <input
              type="number"
              class="h-input rounded-10px border-border-input bg-background text-foreground w-[119px] border pl-10 pr-2 text-base sm:text-sm"
              bind:value={width}
            />
          </div>
          <div class="relative">
            <span class="sr-only">Height</span>
            <span
              aria-hidden="true"
              class="text-xxs text-muted-foreground absolute left-5 top-4"
              >H</span
            >
            <input
              type="number"
              class="h-input rounded-10px border-border-input bg-background text-foreground w-[119px] border pl-10 pr-2 text-base sm:text-sm"
              bind:value={height}
            />
          </div>
        </div>
      </div>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
