# Odysea Monorepo

This repository hosts the code for **Odysea**, a personal productivity ecosystem consisting of multiple applications. The project is structured as a monorepo managed with `pnpm` workspaces and Turborepo.

## Project Structure

The codebase is organized into two main directories: `apps/` for deployable applications, and `packages/` for shared libraries.

### Apps (`apps/`)

- **`extension`** – Svelte 5 browser extension providing a customizable new‑tab page with optional modules such as Unsplash backgrounds, Google Tasks integration, and more.
- **`serverless`** – Deno serverless functions (Hono) used for proxying API calls that require secrets (e.g., Unsplash image requests).
- **`server`** – Raspberry Pi Node.js + Express backend that connects to a local SQLite database via Knex.js for persistent data storage.
- **`cli`** – Command-line interface utilities for the ecosystem.
- **`looper`** – A Node.js application that runs persistently in the background (e.g., via pm2) to execute workflows on a schedule.

### Packages (`packages/`)

Shared libraries intended for use across the apps:

- **`api`** – Shared API types or utilities.
- **`auth`** – Authentication logic.
- **`config`** – Shared configurations (ESLint, Prettier, TypeScript, etc.).
- **`extension`** – Shared extension-specific utilities.
- **`storage`** – Database and storage abstractions.
- **`toolbox`** – General utility functions.
- **`ui`** – Shared UI components.

## Development

Install dependencies from the repository root using `pnpm` (which is the required package manager):

```shell
pnpm install
```

### Running Applications

Use the workspace scripts to run specific apps in development mode via Turborepo:

```shell
pnpm dev:extension    # Start the extension in dev mode
pnpm dev:server       # Start the Node server in dev mode
pnpm dev:looper       # Start the looper background worker
pnpm dev:cli          # Start the CLI in dev mode
```

For other apps like `serverless`, or to run scripts manually in specific packages, you can use the `--filter` flag:

```shell
pnpm --filter @odysea/serverless dev
```

### Quality & Validation

Before committing any changes, ensure the codebase is in a good state by running the local CI script:

```shell
pnpm run local:ci
```

This script will run builds, formatting, linting, typechecking, and tests.

---

See each application's individual `README.md` for more details on features, configuration, and specific setup instructions.
