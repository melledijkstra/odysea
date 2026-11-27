# 2. Chrome Extension Browser Inspection and Testing Tooling

Date: 2026-08-29

## Status

Accepted

## Context

Developing and verifying features in `apps/extension` requires inspecting the extension runtime environment in a real browser (DOM accessibility tree, visual layout, network traffic, console output, and background service workers). Because standard headless browsers disable extensions by default and manual browser launching creates friction, we needed a standardized tooling and inspection strategy for both automated testing (CI / AI agents) and interactive development sessions.

## Decisions

1. **Interactive Development Inspection via Antigravity IDE Browser / Chrome DevTools**: Interactive debugging and visual inspection of extension pages (`chrome-extension://...`) is handled via the Antigravity IDE built-in browser and Chrome DevTools. _(Update 2026-11-27: The custom Playwright CLI harness `apps/extension/scripts/inspect.ts` / `pnpm inspect` was retired as it is no longer needed.)_
2. **Autonomous Automated Testing via Playwright E2E**: Formal test verification continues to live cleanly in `apps/extension/tests/e2e/*.test.ts`, executed via `pnpm test:e2e` and in CI.
3. **Component-Level Inspection via Storybook**: For Svelte 5 UI components and styling, Storybook (`pnpm --filter @odysea/extension storybook` on port 6006) serves as the fast, isolated environment without requiring full extension runtime APIs.

## Consequences

- **Positive**: AI agents and developers can verify extension behavior without maintaining a custom Playwright CDP wrapper script.
- **Negative**: Full extension E2E tests require building the extension first (`apps/extension/dist`) before running.
