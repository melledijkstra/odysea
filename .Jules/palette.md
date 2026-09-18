## 2024-05-14 - Keyboard accessibility for hover-revealed elements
**Learning:** Using `invisible` or `hidden` on elements intended to be revealed on hover removes them from the tab order, making them inaccessible to keyboard users.
**Action:** Use `opacity-0` paired with `focus-visible:opacity-100` (or `group-focus-within:opacity-100` when relying on parent focus) so that the elements remain focusable via the tab key while maintaining the intended visual state.
