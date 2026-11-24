# Looper Setup & Dotfiles Integration

Looper runs persistently in the background using your OS's native user service manager — **`launchd`** on macOS and **`systemd --user`** on Linux — with no global PM2 installation or `sudo` required.

## Prerequisites

- **Node.js `>=20`** (see root `.nvmrc`)
- **`pnpm`** (enabled automatically via `corepack` if available)
- **Native build tools** (for compiling `better-sqlite3`): Xcode Command Line Tools (`xcode-select --install`) on macOS, or `build-essential` + `python3` on Linux
- **Linux desktop notifications (optional)**: `notify-send` (`libnotify-bin` on Debian/Ubuntu, `libnotify` on Arch/Fedora)

## Quick Install (from cloned `odysea` repo)

Run the idempotent service script directly (or from your dotfiles install script):

```bash
./apps/looper/scripts/service.sh install
# Or via pnpm:
pnpm --filter looper service:install
```

What `service.sh install` does:

1. Verifies Node.js `>=20` and `pnpm` (and warns non-fatally if `notify-send` is missing on Linux).
2. Runs `pnpm install --filter looper... --filter . --frozen-lockfile` and `pnpm --filter looper... --if-present build`.
3. Ensures `~/.local/share/looper/logs` exists without writing `config.yaml` or touching `~/.config/looper/workflows` (so dotfiles symlinks never conflict).
4. Installs and starts the native user service:
   - **macOS**: `~/Library/LaunchAgents/com.odysea.looper.plist`
   - **Linux**: `~/.config/systemd/user/looper.service`
5. Polls `http://localhost:<port>/status` to verify Looper is running.

### Service Lifecycle Commands

```bash
./apps/looper/scripts/service.sh install    # Install or update & reload (default)
./apps/looper/scripts/service.sh status     # Service state + GET /status output
./apps/looper/scripts/service.sh restart    # Restart service and verify health
./apps/looper/scripts/service.sh logs       # Tail stdout and stderr logs
./apps/looper/scripts/service.sh uninstall  # Stop & remove service (preserves config/data)
```

Equivalent package scripts are also available via `pnpm --filter looper service:{install,uninstall,restart,status,logs}`.

## XDG Directory Layout

Looper uses consistent XDG paths on **both macOS and Linux**:

| Purpose               | Default Path                         | Override Env Var       |
| :-------------------- | :----------------------------------- | :--------------------- |
| Non-secret config     | `~/.config/looper/config.yaml`       | `LOOPER_CONFIG_DIR`    |
| Workflows directory   | `~/.config/looper/workflows/`        | `LOOPER_WORKFLOWS_DIR` |
| App-specific `.env`   | `~/.config/looper/.env`              | `LOOPER_CONFIG_DIR`    |
| Shared Odysea secrets | `~/.config/odysea/secrets.env`       | `ODYSEA_SECRETS_FILE`  |
| SQLite state database | `~/.local/share/looper/state.db`     | `LOOPER_DATA_DIR`      |
| Google OAuth tokens   | `~/.local/share/looper/.tokens.json` | `LOOPER_DATA_DIR`      |
| Service logs          | `~/.local/share/looper/logs/`        | `LOOPER_DATA_DIR`      |

> [!NOTE]
> Local development (`pnpm dev:looper` / `pnpm --filter looper dev`) sets `LOOPER_CONFIG_DIR=.` and `LOOPER_DATA_DIR=.` so development runs stay isolated to `apps/looper/` and never touch your live XDG directories.

## Configuration & Shared Secrets

Configuration is split into **non-secret settings** (safe to track in dotfiles) and **secrets** (provisioned separately, `chmod 600`):

1. **Non-secret config (optional)**: Copy or symlink [`config.example.yaml`](../config.example.yaml) to `~/.config/looper/config.yaml`. If omitted, Looper uses built-in defaults (`port: 5050`, system timezone, default Google redirect URI & scopes).
2. **Credentials lookup order (highest priority first)**:
   1. Process environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc.)
   2. App-specific override: `~/.config/looper/.env`
   3. Shared dotfiles secrets: `~/.config/odysea/secrets.env`
3. **Graceful fallback**: If no Google credentials are configured, Looper still starts and runs all non-Google workflows normally. `/status` reports `googleAuth.configured: false` until credentials are added.
4. **Google OAuth sign-in**: Once credentials are present, open `http://localhost:5050/auth/google` to complete consent and save tokens to `~/.local/share/looper/.tokens.json`.

## Dotfiles Integration Example

In your dotfiles setup script (after symlinking `~/.config/looper/config.yaml`, `~/.config/looper/workflows/`, and provisioning `~/.config/odysea/secrets.env`):

```bash
"$ODYSEA_DIR/apps/looper/scripts/service.sh" install
```
