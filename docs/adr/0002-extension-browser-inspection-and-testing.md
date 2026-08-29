# 2. Chrome Extension Browser Inspection and Testing Tooling

Date: 2026-08-29

## Status

Accepted

## Context

Developing and verifying features in `apps/extension` requires inspecting the extension runtime environment in a real browser (DOM accessibility tree, visual layout, network traffic, console output, and background service workers). Because standard headless browsers disable extensions by default and manual browser launching creates friction, we needed a standardized tooling and inspection strategy for both automated testing (CI / AI agents) and interactive development sessions.

## Decisions

1. **Interactive Development Inspection via Playwright CLI (`pnpm inspect`)**: We provide a dedicated interactive inspection harness in `apps/extension/scripts/inspect.ts` exposed via `pnpm inspect`. It manages a persistent Playwright Chromium instance with the unpacked extension pre-loaded, automatically discovering the service worker and extension ID, and exposing instant sub-commands (`open`, `snapshot`, `network`, `console`, `eval`, `click`, `fill`, `screenshot`, `close`). This allows AI agents and developers to interact with the live extension in real time without writing ad-hoc scripts or invoking the full E2E test suite.
2. **Autonomous Automated Testing via Playwright E2E**: Formal test verification continues to live cleanly in `apps/extension/tests/e2e/*.test.ts`, executed via `pnpm test:e2e` and in CI.
3. **Component-Level Inspection via Storybook**: For Svelte 5 UI components and styling, Storybook (`pnpm --filter @odysea/extension storybook` on port 6006) serves as the fast, isolated environment without requiring full extension runtime APIs.

## Consequences

- **Positive**: AI agents and developers can autonomously verify extension behavior without manual browser setup. The dual setup supports both fast, reproducible test-driven flows and live interactive debugging.
- **Positive**: Configuration is version-controlled in the repository (`.agents/mcp_config.json` and `playwright.config.ts`), ensuring zero-config onboarding across sessions and contributors.
- **Negative**: Full extension E2E tests require building the extension first (`apps/extension/dist`) before running.
