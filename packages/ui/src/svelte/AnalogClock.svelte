<script lang="ts">
  import { onMount } from 'svelte'

  let hourHand: SVGLineElement
  let minuteHand: SVGLineElement
  let secondHand: SVGLineElement

  function updateClock() {
    const now = new Date()
    const secs = now.getSeconds() + now.getMilliseconds() / 1000
    const mins = now.getMinutes() + secs / 60
    const hrs = (now.getHours() % 12) + mins / 60

    hourHand.setAttribute('transform', `rotate(${hrs * 30}, 150, 150)`)
    minuteHand.setAttribute('transform', `rotate(${mins * 6}, 150, 150)`)
    secondHand.setAttribute('transform', `rotate(${secs * 6}, 150, 150)`)

    requestAnimationFrame(updateClock)
  }

  onMount(() => {
    requestAnimationFrame(updateClock)
  })

  // TODO: Incorporate this code and make it controllable via props
  // for different themes and styles.
  // {
  //   dark: {
  //     bg: '#0f172a', border: '#334155', tick: '#64748b',
  //     hour: '#f8fafc', minute: '#38bdf8', second: '#f43f5e', cap: '#f43f5e'
  //   },
  //   light: {
  //     bg: '#ffffff', border: '#1e293b', tick: '#94a3b8',
  //     hour: '#0f172a', minute: '#0284c7', second: '#dc2626', cap: '#dc2626'
  //   },
  //   cyberpunk: {
  //     bg: '#09090b', border: '#06b6d4', tick: '#ec4899',
  //     hour: '#a855f7', minute: '#06b6d4', second: '#facc15', cap: '#facc15'
  //   },
  //   luxury: {
  //     bg: '#050811', border: '#d97706', tick: '#f59e0b',
  //     hour: '#fbbf24', minute: '#fde68a', second: '#ef4444', cap: '#ef4444'
  //   }
  // }

  // sweeping or not sweeping logic
  // this should be controlled by a prop
  // Calculate smooth vs quartz angles
  // if (state.mode === 'sweep') {
  //   secs += ms / 1000;
  //   mins += secs / 60;
  //   hrs += mins / 60;
  // } else {
  //   mins += secs / 60;
  //   hrs += mins / 60;
  // }
</script>

<svg id="clock" viewBox="0 0 300 300" width="300" height="300">
  <circle
    cx="150"
    cy="150"
    r="140"
    fill="#0f172a"
    stroke="#334155"
    stroke-width="6"
  />
  <g id="hands" stroke-linecap="round">
    <line
      bind:this={hourHand}
      id="hour"
      x1="150"
      y1="150"
      x2="150"
      y2="85"
      stroke="#ffffff"
      stroke-width="6"
    />
    <line
      bind:this={minuteHand}
      id="minute"
      x1="150"
      y1="150"
      x2="150"
      y2="55"
      stroke="#38bdf8"
      stroke-width="4"
    />
    <line
      bind:this={secondHand}
      id="second"
      x1="150"
      y1="170"
      x2="150"
      y2="40"
      stroke="#f43f5e"
      stroke-width="2"
    />
  </g>
  <circle cx="150" cy="150" r="6" fill="#f43f5e" />
</svg>
