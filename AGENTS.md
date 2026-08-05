# AI Agent Documentation

This document provides meta-guidance and configuration for AI agents working on the repository.

For domain knowledge, architectural details, and coding conventions, agents MUST read `CONTEXT.md`.

## Notes for AI Agents

1. **Respect Existing Conventions**: Follow the established patterns and structures in the repository as outlined in `CONTEXT.md`.
2. **Document Contributions**: Update relevant code comments or `CONTEXT.md` when introducing new features or architectural changes.
3. **Explicit Confirmation**: Never start the implementation phase immediately after a planning, design, or grilling session. Always explicitly confirm with the user that it is time to write code, or transition to a specific implementation workflow skill (like TDD or issue creation) before touching the codebase.
4. **Development Workflow**: Use `pnpm` (not `npm`) for all package management commands. Always run `pnpm run local:ci` to verify the codebase is in a good state before committing any changes.
5. **Coding Standards**: Follow formatting and linting standards dictated by Prettier and ESLint

## Agent skills

### Issue tracker

Issues are tracked in GitHub. See `docs/agents/issue-tracker.md`.

### Domain docs

Domain documentation uses a single-context layout (`CONTEXT.md`). See `docs/agents/domain.md`.
