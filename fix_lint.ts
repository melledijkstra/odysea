import fs from 'fs'
const code = fs.readFileSync('apps/extension/src/modules/trackers/MetricsPanel.svelte', 'utf-8')
const replacedCode = code.replace(
  /  function handleDndConsider\(e: CustomEvent<DndEvent<AnyMetric>>\) \{\n    items = e.detail.items\n  \}\n\n  function handleDndFinalize\(e: CustomEvent<DndEvent<AnyMetric>>\) \{\n    items = e.detail.items\n    trackers.setMetricOrder\(items.map\(item => item.id\)\)\n  \}/,
  `  let items = $state<AnyMetric[]>([])

  $effect(() => {
    // Only update items if it's empty or we're not currently dragging to avoid jitter
    // Wait, let's use a non-reactive property for dragging state
    if (!isDragging) {
      items = trackers.allMetrics as AnyMetric[]
    }
  })

  let isDragging = false

  function handleDndConsider(e: CustomEvent<DndEvent<AnyMetric>>) {
    isDragging = true
    items = e.detail.items
  }

  function handleDndFinalize(e: CustomEvent<DndEvent<AnyMetric>>) {
    isDragging = false
    items = e.detail.items
    trackers.setMetricOrder(items.map(item => item.id))
  }`
).replace(
  /  let items = \$derived\(trackers\.allMetrics as AnyMetric\[\]\)/,
  ``
)

fs.writeFileSync('apps/extension/src/modules/trackers/MetricsPanel.svelte', replacedCode)
