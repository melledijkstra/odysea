## 2026-08-29 - Playback Controls Accessibility
**Learning:** When building custom music players with icon-only controls, hover tooltips (`title`) and screen reader labels (`aria-label`) are critical but frequently overlooked in Svelte components.
**Action:** Always check icon-only `<button>` elements in UI implementations for missing `aria-label` and `title` attributes.
