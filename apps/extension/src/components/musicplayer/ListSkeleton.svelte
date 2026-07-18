<script lang="ts">
  const { amount }: { amount: number } = $props()
  const items = $derived(new Array(amount).fill(0))
</script>

<div role="status" class="max-w-md">
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
  {#each items as _, i (i)}
    <div class="flex flex-row w-full items-center p-2 rounded-sm">
      <div class="size-10 mask"></div>
      <div class="flex flex-col ml-2 w-full">
        <!-- title -->
        <div class="h-5 w-1/2 mb-1 mask"></div>
        <!-- track count -->
        <div class="h-3 w-10 mask"></div>
      </div>
    </div>
  {/each}
</div>

<style lang="postcss">
  @reference '../../app.css';

  .mask {
    @apply animate-pulse rounded bg-gray-300 dark:bg-gray-600;
  }
</style>
