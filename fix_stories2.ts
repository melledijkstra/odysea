import fs from 'fs'

let code = fs.readFileSync('apps/extension/stories/metrics/MetricsBar.stories.svelte', 'utf-8')
code = code.replace(/export const metricMock: Metric\[\] = \[/g, "export const metricMock = [\n  {\n    id: '1',\n    type: 'counter',\n    name: 'Counter',\n    value: 5,\n    pinned: true,\n  },\n  {\n    id: '2',\n    type: 'worldClock',\n    name: 'Amsterdam',\n    timeZone: 'Europe/Amsterdam',\n    pinned: true,\n  },\n  {\n    id: '3',\n    type: 'countdown',\n    name: 'Vacation',\n    date: new Date().valueOf() + 5 * 24 * 60 * 60 * 1000,\n    pinned: true,\n  },\n]\n/*")
code = code.replace(/    date: new Date\(\)\.valueOf\(\) \+ 5 \* 24 \* 60 \* 60 \* 1000,\n    pinned: true,\n  },\n\]/g, "    date: new Date().valueOf() + 5 * 24 * 60 * 60 * 1000,\n    pinned: true,\n  },\n]\n*/")

// remove the type casting logic
code = code.replace(/<Story name="With Metrics"/g, "<!--")
code = code.replace(/<\/Story>/g, "-->\n</Story>")


fs.writeFileSync('apps/extension/stories/metrics/MetricsBar.stories.svelte', code)
