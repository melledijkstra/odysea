#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# Odysea Looper — Native Service Manager (macOS launchd / Linux systemd --user)
#
# Idempotent installer & lifecycle CLI designed to be invoked directly from a
# cloned odysea repo (e.g. during dotfiles setup) or via pnpm scripts.
#
# Usage:
#   ./apps/looper/scripts/service.sh [install|uninstall|restart|status|logs]
# ---------------------------------------------------------------------------

SCRIPT_SOURCE="${BASH_SOURCE[0]}"
while [[ -L "$SCRIPT_SOURCE" ]]; do
  SCRIPT_DIR="$(cd -P "$(dirname "$SCRIPT_SOURCE")" && pwd)"
  SCRIPT_SOURCE="$(readlink "$SCRIPT_SOURCE")"
  [[ "$SCRIPT_SOURCE" != /* ]] && SCRIPT_SOURCE="$SCRIPT_DIR/$SCRIPT_SOURCE"
done
SCRIPT_DIR="$(cd -P "$(dirname "$SCRIPT_SOURCE")" && pwd)"
LOOPER_DIR="$(cd -P "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd -P "$LOOPER_DIR/../.." && pwd)"

OS="$(uname -s)"
SERVICE_LABEL="com.odysea.looper"
SYSTEMD_SERVICE_NAME="looper.service"

XDG_CONFIG_BASE="${XDG_CONFIG_HOME:-$HOME/.config}"
XDG_DATA_BASE="${XDG_DATA_HOME:-$HOME/.local/share}"
CONFIG_DIR="${LOOPER_CONFIG_DIR:-$XDG_CONFIG_BASE/looper}"
DATA_DIR="${LOOPER_DATA_DIR:-$XDG_DATA_BASE/looper}"
LOGS_DIR="$DATA_DIR/logs"
SHARED_SECRETS_FILE="${ODYSEA_SECRETS_FILE:-$XDG_CONFIG_BASE/odysea/secrets.env}"

PLIST_PATH="$HOME/Library/LaunchAgents/$SERVICE_LABEL.plist"
SYSTEMD_USER_DIR="$XDG_CONFIG_BASE/systemd/user"
SYSTEMD_UNIT_PATH="$SYSTEMD_USER_DIR/$SYSTEMD_SERVICE_NAME"

log() {
  printf '[looper-service] %s\n' "$*"
}

warn() {
  printf '[looper-service] WARN: %s\n' "$*" >&2
}

die() {
  printf '[looper-service] ERROR: %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<EOF
Usage: $(basename "$0") [command]

Commands:
  install     Install dependencies, build workspace packages, and register/reload the native user service (default)
  uninstall   Stop and remove the native user service (preserves config & data directories)
  restart     Restart the running service
  status      Show service status and query the /status HTTP endpoint
  logs        Tail stdout and stderr service logs
  -h, --help  Show this help message

Environment overrides:
  LOOPER_CONFIG_DIR      Config directory (default: ~/.config/looper)
  LOOPER_DATA_DIR        Data/state/logs directory (default: ~/.local/share/looper)
  LOOPER_WORKFLOWS_DIR   Workflows directory (default: <configDir>/workflows)
  ODYSEA_SECRETS_FILE    Shared secrets file (default: ~/.config/odysea/secrets.env)
EOF
}

require_supported_os() {
  case "$OS" in
    Darwin|Linux) ;;
    *) die "Unsupported operating system: $OS (expected Darwin or Linux)" ;;
  esac
}

check_prerequisites() {
  if ! command -v node >/dev/null 2>&1; then
    die "Node.js (>=20) is required but was not found in PATH. Install Node.js first and re-run."
  fi

  local node_version node_major
  node_version="$(node -v)"
  node_major="${node_version#v}"
  node_major="${node_major%%.*}"
  if [[ ! "$node_major" =~ ^[0-9]+$ ]] || (( node_major < 20 )); then
    die "Node.js >=20 is required (found $node_version)."
  fi

  NODE_BIN="$(command -v node)"
  NODE_DIR="$(dirname "$NODE_BIN")"
  log "Using Node.js $node_version ($NODE_BIN)"

  if ! command -v pnpm >/dev/null 2>&1; then
    if command -v corepack >/dev/null 2>&1; then
      log "pnpm not found — enabling via corepack..."
      corepack enable || true
    fi
  fi

  if ! command -v pnpm >/dev/null 2>&1; then
    die "pnpm is required but was not found in PATH. Enable it with 'corepack enable' or install from https://pnpm.io/installation."
  fi
  log "Using pnpm $(pnpm -v)"

  if [[ "$OS" == "Linux" ]]; then
    if ! command -v systemctl >/dev/null 2>&1; then
      die "systemctl is required on Linux to manage the user service."
    fi
    if ! command -v notify-send >/dev/null 2>&1; then
      warn "'notify-send' not found. Desktop notifications (system.notify) require libnotify (e.g. 'sudo apt install libnotify-bin' or 'sudo pacman -S libnotify')."
    fi
    if ! command -v gdbus >/dev/null 2>&1 && ! command -v xprintidle >/dev/null 2>&1; then
      warn "Neither 'gdbus' nor 'xprintidle' was found. 'active_time' workflow triggers require a desktop session with gdbus (glib2) or xprintidle (X11)."
    fi
  fi
}

install_workspace_deps() {
  log "Installing scoped dependencies for looper..."
  (cd "$REPO_ROOT" && pnpm install --filter looper... --filter . --frozen-lockfile)

  log "Building workspace dependencies for looper..."
  (cd "$REPO_ROOT" && pnpm --filter looper... --if-present build)
}

resolve_port() {
  local node_cmd port
  node_cmd="${NODE_BIN:-$(command -v node 2>/dev/null || true)}"
  if [[ -n "$node_cmd" && -d "$LOOPER_DIR/node_modules" ]]; then
    port="$(
      cd "$LOOPER_DIR" &&
        "$node_cmd" --import tsx -e "import { config } from './config.js'; process.stdout.write(String(config.port))" 2>/dev/null || true
    )"
    if [[ "$port" =~ ^[0-9]+$ ]]; then
      printf '%s\n' "$port"
      return
    fi
  fi
  printf '%s\n' "${PORT:-5050}"
}

xml_escape() {
  local value="$1"
  value="${value//&/&amp;}"
  value="${value//</&lt;}"
  value="${value//>/&gt;}"
  value="${value//\"/&quot;}"
  printf '%s' "$value"
}

write_launchd_plist() {
  mkdir -p "$(dirname "$PLIST_PATH")" "$LOGS_DIR"

  local service_path="$NODE_DIR:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
  local extra_env=""

  for var_name in XDG_CONFIG_HOME XDG_DATA_HOME LOOPER_CONFIG_DIR LOOPER_DATA_DIR LOOPER_WORKFLOWS_DIR ODYSEA_SECRETS_FILE; do
    if [[ -n "${!var_name:-}" ]]; then
      extra_env+="    <key>$(xml_escape "$var_name")</key>"$'\n'
      extra_env+="    <string>$(xml_escape "${!var_name}")</string>"$'\n'
    fi
  done

  cat >"$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$(xml_escape "$SERVICE_LABEL")</string>

  <key>ProgramArguments</key>
  <array>
    <string>$(xml_escape "$NODE_BIN")</string>
    <string>--import</string>
    <string>tsx</string>
    <string>$(xml_escape "$LOOPER_DIR/index.ts")</string>
  </array>

  <key>WorkingDirectory</key>
  <string>$(xml_escape "$LOOPER_DIR")</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key>
    <string>$(xml_escape "$HOME")</string>
    <key>NODE_ENV</key>
    <string>production</string>
    <key>PATH</key>
    <string>$(xml_escape "$service_path")</string>
${extra_env}  </dict>

  <key>RunAtLoad</key>
  <true/>

  <key>KeepAlive</key>
  <true/>

  <key>StandardOutPath</key>
  <string>$(xml_escape "$LOGS_DIR/looper.out.log")</string>

  <key>StandardErrorPath</key>
  <string>$(xml_escape "$LOGS_DIR/looper.err.log")</string>
</dict>
</plist>
EOF

  local domain="gui/$(id -u)"
  launchctl bootout "$domain/$SERVICE_LABEL" 2>/dev/null || true
  launchctl bootstrap "$domain" "$PLIST_PATH"
  launchctl kickstart -k "$domain/$SERVICE_LABEL" 2>/dev/null || true
  log "Installed and started launchd agent: $PLIST_PATH"
}

write_systemd_unit() {
  mkdir -p "$SYSTEMD_USER_DIR" "$LOGS_DIR"

  local service_path="$NODE_DIR:/usr/local/bin:/usr/bin:/bin"
  local extra_env=""

  for var_name in XDG_CONFIG_HOME XDG_DATA_HOME LOOPER_CONFIG_DIR LOOPER_DATA_DIR LOOPER_WORKFLOWS_DIR ODYSEA_SECRETS_FILE; do
    if [[ -n "${!var_name:-}" ]]; then
      extra_env+="Environment=\"${var_name}=${!var_name}\""$'\n'
    fi
  done

  cat >"$SYSTEMD_UNIT_PATH" <<EOF
[Unit]
Description=Odysea Looper Workflow Automation Daemon
After=default.target

[Service]
Type=simple
WorkingDirectory=${LOOPER_DIR}
ExecStart="${NODE_BIN}" --import tsx "${LOOPER_DIR}/index.ts"
Restart=on-failure
RestartSec=5
Environment="NODE_ENV=production"
Environment="PATH=${service_path}"
${extra_env}StandardOutput=append:${LOGS_DIR}/looper.out.log
StandardError=append:${LOGS_DIR}/looper.err.log

[Install]
WantedBy=default.target
EOF

  if ! systemctl --user daemon-reload; then
    die "Failed to contact systemd user daemon. Make sure you are in a systemd user session (XDG_RUNTIME_DIR set)."
  fi
  systemctl --user enable "$SYSTEMD_SERVICE_NAME"
  systemctl --user restart "$SYSTEMD_SERVICE_NAME"
  log "Installed and started systemd user service: $SYSTEMD_UNIT_PATH"
}

wait_for_health() {
  local port="$1"
  local status_url="http://localhost:${port}/status"
  local response=""

  log "Checking health at $status_url..."
  for _ in $(seq 1 20); do
    if response="$(curl -fsS --max-time 2 "$status_url" 2>/dev/null)"; then
      log "Looper is healthy at $status_url"
      if command -v node >/dev/null 2>&1; then
        LOOPER_STATUS_JSON="$response" SHARED_SECRETS_HINT="$SHARED_SECRETS_FILE" APP_ENV_HINT="$CONFIG_DIR/.env" node -e '
          const data = JSON.parse(process.env.LOOPER_STATUS_JSON || "{}");
          const wfCount = Array.isArray(data.workflows) ? data.workflows.length : 0;
          const google = data.googleAuth || {};
          console.log(`[looper-service] Loaded workflows: ${wfCount} (${data.paths?.workflowsDir ?? "unknown"})`);
          if (!google.configured) {
            console.log(`[looper-service] Google auth: not configured (optional). To enable Google actions, add GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET to ${process.env.SHARED_SECRETS_HINT} or ${process.env.APP_ENV_HINT}.`);
          } else if (!google.authenticated) {
            console.log(`[looper-service] Google auth: configured (${google.credentialsSource}), awaiting sign-in at ${google.authUrl}`);
          } else {
            console.log(`[looper-service] Google auth: authenticated (${google.credentialsSource})`);
          }
        '
      fi
      return 0
    fi
    sleep 0.5
  done

  warn "Timed out waiting for $status_url."
  if [[ -f "$LOGS_DIR/looper.err.log" ]]; then
    warn "Recent stderr logs ($LOGS_DIR/looper.err.log):"
    tail -n 20 "$LOGS_DIR/looper.err.log" >&2 || true
  fi
  return 1
}

cmd_install() {
  require_supported_os
  check_prerequisites
  install_workspace_deps

  mkdir -p "$LOGS_DIR"

  if [[ "$OS" == "Darwin" ]]; then
    write_launchd_plist
  else
    write_systemd_unit
  fi

  local port
  port="$(resolve_port)"
  wait_for_health "$port"
}

cmd_uninstall() {
  require_supported_os
  if [[ "$OS" == "Darwin" ]]; then
    local domain="gui/$(id -u)"
    launchctl bootout "$domain/$SERVICE_LABEL" 2>/dev/null || true
    if [[ -f "$PLIST_PATH" ]]; then
      rm -f "$PLIST_PATH"
      log "Removed launchd agent: $PLIST_PATH"
    else
      log "No launchd agent found at $PLIST_PATH"
    fi
  else
    if command -v systemctl >/dev/null 2>&1; then
      systemctl --user disable --now "$SYSTEMD_SERVICE_NAME" 2>/dev/null || true
    fi
    if [[ -f "$SYSTEMD_UNIT_PATH" ]]; then
      rm -f "$SYSTEMD_UNIT_PATH"
      log "Removed systemd unit: $SYSTEMD_UNIT_PATH"
    else
      log "No systemd unit found at $SYSTEMD_UNIT_PATH"
    fi
    if command -v systemctl >/dev/null 2>&1; then
      systemctl --user daemon-reload 2>/dev/null || true
    fi
  fi
  log "Preserved config ($CONFIG_DIR) and data ($DATA_DIR)."
}

cmd_restart() {
  require_supported_os
  if [[ "$OS" == "Darwin" ]]; then
    local domain="gui/$(id -u)"
    [[ -f "$PLIST_PATH" ]] || die "Service not installed ($PLIST_PATH missing). Run '$(basename "$0") install' first."
    launchctl kickstart -k "$domain/$SERVICE_LABEL"
  else
    [[ -f "$SYSTEMD_UNIT_PATH" ]] || die "Service not installed ($SYSTEMD_UNIT_PATH missing). Run '$(basename "$0") install' first."
    systemctl --user restart "$SYSTEMD_SERVICE_NAME"
  fi
  local port
  port="$(resolve_port)"
  wait_for_health "$port"
}

cmd_status() {
  require_supported_os
  if [[ "$OS" == "Darwin" ]]; then
    launchctl print "gui/$(id -u)/$SERVICE_LABEL" 2>/dev/null | head -n 30 || warn "launchd service $SERVICE_LABEL is not loaded."
  else
    systemctl --user status "$SYSTEMD_SERVICE_NAME" --no-pager || true
  fi

  local port status_url
  port="$(resolve_port)"
  status_url="http://localhost:${port}/status"
  printf '\n'
  if curl -fsS --max-time 2 "$status_url" 2>/dev/null; then
    printf '\n'
  else
    warn "HTTP endpoint $status_url is not reachable."
    return 1
  fi
}

cmd_logs() {
  mkdir -p "$LOGS_DIR"
  touch "$LOGS_DIR/looper.out.log" "$LOGS_DIR/looper.err.log"
  log "Tailing logs in $LOGS_DIR (Ctrl+C to exit)..."
  exec tail -n 50 -f "$LOGS_DIR/looper.out.log" "$LOGS_DIR/looper.err.log"
}

main() {
  local command="${1:-install}"
  case "$command" in
    install) cmd_install ;;
    uninstall) cmd_uninstall ;;
    restart) cmd_restart ;;
    status) cmd_status ;;
    logs) cmd_logs ;;
    -h|--help|help) usage ;;
    *) die "Unknown command: $command (run with --help for usage)" ;;
  esac
}

main "$@"
