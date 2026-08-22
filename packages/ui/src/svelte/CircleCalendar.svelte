<script lang="ts">
  const daysInMonth = 31
  const today = new Date().getDate()

  // Example: add dots on these days
  const dots = new Set([2, 5, 8, 14, 20, 25])

  function isToday(day: number) {
    return day === today
  }

  function hasDot(day: number) {
    return dots.has(day)
  }
</script>

<div class="grid grid-cols-7 gap-2 p-4">
  {#each Array.from({ length: daysInMonth }, (_, i) => i + 1) as day (day)}
    <div class="flex flex-col items-center text-sm">
      <div
        class="w-8 h-8 flex items-center justify-center rounded-full
                {isToday(day)
          ? 'bg-blue-500 text-white'
          : 'bg-gray-500 text-white dark:bg-gray-100 dark:text-gray-800'}"
      >
        {day}
      </div>
      {#if hasDot(day)}
        <div class="w-1.5 h-1.5 mt-1 rounded-full bg-blue-500"></div>
      {/if}
    </div>
  {/each}
</div>
