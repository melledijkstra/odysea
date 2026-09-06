## 2024-03-20 - Adding ARIA attributes to Svelte components

**Learning:** Found several components missing ARIA labels and using `button` or `input` elements without accessible names. Many action buttons or visual feedback elements rely solely on icons or non-text content.
**Action:** Always verify `aria-label` and `title` attributes on `button` and `input` elements in components like `TaskItem`, `Pomodoro`, `Breathing`, etc., especially those lacking explicit textual descriptions. Svelte provides easy ways to bind or pass these attributes.
