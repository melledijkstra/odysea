# Odysea Monorepo

This repository hosts the code for **Odysea**, a personal productivity ecosystem consisting of multiple applications. Each application lives in the `apps/` directory and has its own README with setup instructions.

## Directory Overview

- **`apps/extension`** – Svelte browser extension providing a customizable new‑tab page with optional modules such as Unsplash backgrounds, Google Tasks integration and more.
- **`apps/serverless`** – Deno serverless functions (Hono) used for API calls that require secrets, e.g. Unsplash image requests.
- **`apps/server`** – RaspberryPi Node + Express server that connects with an SQLite database via Knex to store perminent data storage.

## Development

Install dependencies from the repository root:

```bash
pnpm install
```

Use the workspace scripts to run or build specific apps. For example:

```bash
pnpm -filter @odysea/extension dev      # start extension in dev mode
pnpm -filter @odysea/serverless dev     # run serverless functions
pnpm -filter @odysea/server start       # start the Node server
...
```

See each application's README for more details on features and configuration.
