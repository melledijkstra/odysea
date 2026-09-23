## 2026-08-29 - Playback Controls Accessibility

**Learning:** When building custom music players with icon-only controls, hover tooltips (`title`) and screen reader labels (`aria-label`) are critical but frequently overlooked in Svelte components.
**Action:** Always check icon-only `<button>` elements in UI implementations for missing `aria-label` and `title` attributes.

## 2024-03-20 - Adding ARIA attributes to Svelte components

**Learning:** Found several components missing ARIA labels and using `button` or `input` elements without accessible names. Many action buttons or visual feedback elements rely solely on icons or non-text content.
**Action:** Always verify `aria-label` and `title` attributes on `button` and `input` elements in components like `TaskItem`, `Pomodoro`, `Breathing`, etc., especially those lacking explicit textual descriptions. Svelte provides easy ways to bind or pass these attributes.

## 2024-03-20 - Adding Tooltips and ARIA attributes to Icon-Only Svelte Buttons
**Learning:** Found an icon-only button inside `PlaylistItem.svelte` that lacked `aria-label` and `title` attributes, which are essential for screen reader access and visual tooltips.
**Action:** When working on Svelte components containing icon-only `<button>`s, ensure that both `aria-label` and `title` attributes are set.
