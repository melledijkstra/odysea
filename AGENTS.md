# AI Agent Documentation

This document provides meta-guidance and configuration for AI agents working on the repository.

For domain knowledge, architectural details, and coding conventions, agents MUST read `CONTEXT.md`.

## Notes for AI Agents

- **Respect Existing Conventions**: Follow the established patterns and structures in the repository as outlined in `CONTEXT.md`.
- **Document Contributions**: Update relevant code comments or `CONTEXT.md` when introducing new features or architectural changes.
- **Explicit Confirmation**: Never start the implementation phase immediately after a planning, design, or grilling session. Always explicitly confirm with the user that it is time to write code, or transition to a specific implementation workflow skill (like TDD or issue creation) before touching the codebase.
- **Development Workflow**: Use `pnpm` (not `npm`) for all package management commands. Always run `pnpm run local:ci` to verify the codebase is in a good state before committing any changes. For formatting code use `pnpm run format:fix`.
- **Coding Standards**: Follow formatting and linting standards dictated by Prettier and ESLint
- Don't use `any`, instead try to actual type correctly the code, only in some special cases `unknown` can be used. If unsure, ask the user.
- Don't silence eslint issues, instead try to tackle them and resolve the issue.
- **Pure UI Components**: Keep UI components pure/presentational and decoupled from API clients, queries, or business logic. Pass plain props and callbacks from container components so UI components stay easy to test and render in Storybook.

## Agent skills

### Issue tracker

Issues are tracked in GitHub. See `docs/agents/issue-tracker.md`.

### Domain docs

Domain documentation uses a single-context layout (`CONTEXT.md`). See `docs/agents/domain.md`.

### Extension Inspection & Testing

- **Built-in IDE Browser / Chrome DevTools (Preferred)**: Use the Antigravity IDE built-in browser or Chrome DevTools for interactive testing, debugging, and visual inspection of extension pages (e.g., `chrome-extension://...`) and web apps/Storybook.
- **Automated Verification**: For formal test validation, run Playwright E2E tests (`pnpm --filter @odysea/extension test:e2e`).
- **Storybook UI Inspection**: For isolated component styling and layout changes, run and inspect Storybook on port 6006 (`pnpm --filter @odysea/extension storybook`).
