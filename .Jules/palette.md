## 2026-08-29 - Playback Controls Accessibility

**Learning:** When building custom music players with icon-only controls, hover tooltips (`title`) and screen reader labels (`aria-label`) are critical but frequently overlooked in Svelte components.
**Action:** Always check icon-only `<button>` elements in UI implementations for missing `aria-label` and `title` attributes.

## 2024-05-14 - Keyboard accessibility for hover-revealed elements

**Learning:** Using `invisible` or `hidden` on elements intended to be revealed on hover removes them from the tab order, making them inaccessible to keyboard users.
**Action:** Use `opacity-0` paired with `focus-visible:opacity-100` (or `group-focus-within:opacity-100` when relying on parent focus) so that the elements remain focusable via the tab key while maintaining the intended visual state.

## 2024-03-20 - Adding ARIA attributes to Svelte components

**Learning:** Found several components missing ARIA labels and using `button` or `input` elements without accessible names. Many action buttons or visual feedback elements rely solely on icons or non-text content.
**Action:** Always verify `aria-label` and `title` attributes on `button` and `input` elements in components like `TaskItem`, `Pomodoro`, `Breathing`, etc., especially those lacking explicit textual descriptions. Svelte provides easy ways to bind or pass these attributes.

## 2024-03-20 - Adding Tooltips and ARIA attributes to Icon-Only Svelte Buttons

**Learning:** Found an icon-only button inside `PlaylistItem.svelte` that lacked `aria-label` and `title` attributes, which are essential for screen reader access and visual tooltips.
**Action:** When working on Svelte components containing icon-only `<button>`s, ensure that both `aria-label` and `title` attributes are set.

## 2025-02-12 - Added Focus Styles and ARIA Labels to Menu Items
**Learning:** When using `bits-ui` headless primitives like `Popover.Trigger` or `Tooltip` in this codebase, focus styles (e.g., `focus-visible:ring-2`) and ARIA labels/titles are not applied by default. Screen reader users and keyboard navigators miss critical context and visual feedback if these are omitted.
**Action:** Always manually apply `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden rounded-sm` and include `aria-label` and `title` attributes on custom `bits-ui` triggers, especially for icon-only buttons.
