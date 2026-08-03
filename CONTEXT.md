# Odysea Context

This is a monorepo housing a personal productivity ecosystem created by Melle Dijkstra. It contains multiple applications and shared packages managed via `pnpm` workspaces and Turborepo.

## Project Structure

The codebase is organized into two main directories: `apps/` for deployable applications, and `packages/` for shared libraries and configuration.

### Apps (`apps/`)

- **`extension`**: A browser extension built with Svelte. It provides a customizable new-tab page with various modules.
- **`serverless`**: Serverless functions running on Deno using the Hono framework. Used to proxy API calls that require sensitive secrets (e.g., Unsplash API keys).
- **`server`**: A Node.js + Express backend designed to run on a Raspberry Pi. It connects to a local SQLite database using Knex.js for persistent data storage.
- **`cli`**: Command-line interface utilities for the ecosystem.
- **`looper`**: A Node.js app which runs persistently in the background using pm2. It runs workflows on a schedule.

### Packages (`packages/`)

Shared libraries intended for use across the apps:

- **`api`**: Shared API types or utilities.
- **`auth`**: Authentication logic.
- **`config`**: Shared configurations (ESLint, Prettier, TypeScript, etc.).
- **`extension`**: Shared extension-specific utilities.
- **`storage`**: Database and storage abstractions.
- **`toolbox`**: General utility functions.
- **`ui`**: Shared UI components.

## Preferred Technology Stack

- **Package Manager**: pnpm
- **Monorepo Tooling**: Turborepo
- **Frontend**: Svelte 5, Vite, Bits UI, TailwindCSS
- **Backend**: Node.js, Express, SQLite
- **Testing**: Vitest
- **Code Quality**: Prettier for formatting, eslint for code quality, TypeScript for strict typing

## Conventions & Rules

1. **TypeScript First**: Ensure all new API and UI components are strictly typed.
2. **Svelte 5**: Follow modern Svelte 5 conventions for component development in frontend apps.
3. **Environment Variables**: Sensitive data such as API keys must be loaded from environment variables (e.g., in `apps/serverless`).
4. **Testing**: Add or update unit tests using `pnpm test` when modifying functionality.
5. **Architecture Decisions**: Document significant structural changes in `docs/adr/`.
