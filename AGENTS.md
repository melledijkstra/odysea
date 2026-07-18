# AI Agent Documentation for the current repository

This document provides guidance for AI agents working on the repository. It outlines the structure, conventions, and key components of the project to ensure consistent and efficient contributions.

## Repository Overview

The `odysea` repository contains multiple applications and configurations, including a browser extension, a server, and serverless functions. The project uses modern web development tools and frameworks such as Svelte, Vite, and TailwindCSS.

### Monorepo Packages

Monorepo packages live in `apps/*`

---

## Coding Conventions

### TypeScript and Svelte

- Use TypeScript for type safety in both API and UI components.
- Follow modern Svelte 5 conventions for component-based development.

### File Structure

- Organize files by feature or functionality.
- Use descriptive filenames and maintain consistent naming conventions.

---

## Notes for AI Agents

1. **Respect Existing Conventions**: Follow the established patterns and structures in the repository.
2. **Use Environment Variables**: Ensure sensitive data like API keys are loaded from environment variables.
3. **Test Changes**: Validate functionality using the provided configurations and tools.
4. **Document Contributions**: Update this document or relevant code comments when introducing new features or changes.
5. **Running Unit Tests**: Always use `pnpm test` to execute unit tests within packages (e.g. `apps/extension`).
