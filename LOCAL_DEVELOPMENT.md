# Local Development Guide

This guide explains how to use packages from this monorepo in external projects during development.

## 🎯 Recommended Approaches

### Option 1: pnpm link (Recommended)

**Best for:** Most use cases, fast iteration without extra tooling

#### Usage

**In this monorepo — build the packages:**

```bash
pnpm build
```

**In your external project — link directly to the package path:**

```bash
pnpm link /absolute/path/to/toolbox/packages/auth
pnpm link /absolute/path/to/toolbox/packages/storage
```

That's it. No setup needed in this repo beyond having it built.

**When you make changes:**

```bash
# In this monorepo - rebuild after changes (symlink stays in place)
pnpm build

# Or watch for changes automatically (if configured)
pnpm build --watch
```

**Cleanup:**

```bash
# In external project
pnpm unlink @melledijkstra/auth @melledijkstra/storage
```

---

### Option 2: File Protocol (Simplest)

**Best for:** Simple cases, stable relative paths

**In your external project's `package.json`:**

```json
{
  "dependencies": {
    "@melledijkstra/auth": "file:../toolbox/packages/auth",
    "@melledijkstra/storage": "file:../toolbox/packages/storage"
  }
}
```

Then run `pnpm install`. Changes require rebuilding the packages (`pnpm build` in this repo).

---

## 🔄 Workflow Recommendations

### Daily Development with pnpm link

```bash
# 1. Make changes in this monorepo
# 2. Rebuild to propagate updates (symlink is already in place)
pnpm build

# Your external projects pick up changes automatically via symlinks!
```

### Before Committing

```bash
pnpm local:ci
```

### Publishing to npm (when ready)

```bash
pnpm build && pnpm test --run

cd packages/auth
pnpm run publish
```

---

## ⚠️ Common Issues

### "Cannot find module" with pnpm link

- Ensure packages are built: `pnpm build`
- Re-run `pnpm link <path>` in the consuming project

### Changes not reflecting

- **With pnpm link:** Rebuild the package (`pnpm build`) and restart your dev server if needed
- **With file protocol:** Rebuild the package (`pnpm build`)

### TypeScript errors with linked packages

- Ensure `tsconfig.json` preserves symlinks in the consuming project:

  ```json
  {
    "compilerOptions": {
      "preserveSymlinks": true
    }
  }
  ```

---

## 💡 Tips

1. **pnpm link** is the recommended approach — just point the consumer at the package path
2. Keep this repo built when developing: `pnpm build --watch` (if configured)
3. Remember to `pnpm unlink` in the consumer before publishing to npm
4. For React/UI packages, you may need to dedupe dependencies in the consuming project
