import fs from 'fs'

let code = fs.readFileSync('apps/extension/stories/metrics/Countdown.stories.svelte', 'utf-8')
code = code.replace(/name: '5 days until vacation',/g, "id: '1',\n        name: '5 days until vacation',")
fs.writeFileSync('apps/extension/stories/metrics/Countdown.stories.svelte', code)

code = fs.readFileSync('apps/extension/stories/metrics/MetricsBar.stories.svelte', 'utf-8')
code = code.replace(/export const metricMock: Metric\[\] = \[/g, "export const metricMock: Metric[] = [\n  {\n    id: '1',\n    type: 'counter',\n    name: 'Counter',\n    value: 5,\n    pinned: true,\n  },\n  {\n    id: '2',\n    type: 'worldClock',\n    name: 'Amsterdam',\n    timeZone: 'Europe/Amsterdam',\n    pinned: true,\n  },\n  {\n    id: '3',\n    type: 'countdown',\n    name: 'Vacation',\n    date: new Date().valueOf() + 5 * 24 * 60 * 60 * 1000,\n    pinned: true,\n  },\n]\n/*")
code = code.replace(/    date: new Date\(\)\.valueOf\(\) \+ 5 \* 24 \* 60 \* 60 \* 1000,\n    pinned: true,\n  },\n\]/g, "    date: new Date().valueOf() + 5 * 24 * 60 * 60 * 1000,\n    pinned: true,\n  },\n]\n*/")
fs.writeFileSync('apps/extension/stories/metrics/MetricsBar.stories.svelte', code)


code = fs.readFileSync('apps/extension/stories/metrics/WorldClock.stories.svelte', 'utf-8')
code = code.replace(/name: 'Amsterdam',/g, "id: '1',\n      name: 'Amsterdam',")
code = code.replace(/name: 'Tokyo',/g, "id: '2',\n      name: 'Tokyo',")
fs.writeFileSync('apps/extension/stories/metrics/WorldClock.stories.svelte', code)
