<script lang="ts">
  const WEEKS = 53 // ~1 year
  const DAYS = 7

  // Generate fake data: 0 (no activity) to 4 (high activity)
  const activityData = Array.from({ length: WEEKS * DAYS }, () =>
    (() => {
      // 0: 60% chance, 1: 20%, 2: 10%, 3: 6%, 4: 4%
      const r = Math.random()
      if (r < 0.6) return 0
      if (r < 0.8) return 1
      if (r < 0.9) return 2
      if (r < 0.96) return 3
      return 4
    })(),
  )

  // Tailwind color scale classes (adjust to your palette)
  const colorClasses = [
    'bg-gray-200', // 0 activity
    'bg-green-100',
    'bg-green-300',
    'bg-green-500',
    'bg-green-700', // max activity
  ]
</script>

<div class="overflow-x-auto p-4">
  <div class="flex gap-1">
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
    {#each Array.from({ length: WEEKS }) as _week, weekIdx (weekIdx)}
      <div class="flex flex-col gap-1">
        <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
        {#each Array.from({ length: DAYS }) as _day, dayIdx (dayIdx)}
          <div
            class={`w-3.5 h-3.5 rounded-sm ${colorClasses[activityData[weekIdx * DAYS + dayIdx]]}`}
          ></div>
        {/each}
      </div>
    {/each}
  </div>
</div>
