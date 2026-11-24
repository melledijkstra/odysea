import { Logger } from '@melledijkstra/toolbox'
import { execSync } from 'node:child_process'
import type { TriggerManager } from './scheduler.js'
import type { Workflow } from './types/workflow.js'

const logger = new Logger('ActiveTimeTriggerManager')

const COMMAND_TIMEOUT_MS = 2000
const INHIBITION_CHECK_THRESHOLD_SEC = 10

const EXEC_OPTIONS = {
  encoding: 'utf8' as const,
  timeout: COMMAND_TIMEOUT_MS,
  stdio: ['ignore', 'pipe', 'pipe'] as ['ignore', 'pipe', 'pipe'],
}

export interface IdleTimeProvider {
  readonly name: string
  getIdleSeconds(): number
}

interface LinuxIdleBackend {
  readonly name: string
  readIdleSeconds(): number
}

export function parseDBusIdleSeconds(output: string): number {
  const match = /\(\s*(?:uint(?:32|64)\s+)?(\d+)\s*,?\s*\)/.exec(output)
  if (!match?.[1]) {
    throw new Error(`Unexpected D-Bus idle time output: ${output.trim()}`)
  }
  const ms = Number.parseInt(match[1], 10)
  return Math.floor(ms / 1000)
}

export function parseXprintidleSeconds(output: string): number {
  const trimmed = output.trim()
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`Unexpected xprintidle output: ${trimmed}`)
  }
  const ms = Number.parseInt(trimmed, 10)
  return Math.floor(ms / 1000)
}

export function isSystemdIdleInhibited(output: string): boolean {
  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    // Format: WHO  UID  USER  PID  COMM  WHAT  WHY  MODE
    const match = /\b\d+\s+\S+\s+\d+\s+\S+\s+(\S+)\s+.*\bblock\s*$/.exec(line)
    if (!match?.[1]) continue
    const whatCapabilities = match[1].split(':')
    if (whatCapabilities.includes('idle')) {
      return true
    }
  }
  return false
}

function isLinuxIdleInhibited(): boolean {
  try {
    const gnomeOutput = execSync(
      'gdbus call --session --dest org.gnome.SessionManager --object-path /org/gnome/SessionManager --method org.gnome.SessionManager.IsInhibited 8',
      EXEC_OPTIONS
    )
    if (/\(\s*true\s*,?\s*\)/i.test(gnomeOutput)) {
      return true
    }
  } catch {
    // GNOME SessionManager may not be available on non-GNOME desktops
  }

  try {
    const systemdOutput = execSync(
      'systemd-inhibit --list --no-legend',
      EXEC_OPTIONS
    )
    if (isSystemdIdleInhibited(systemdOutput)) {
      return true
    }
  } catch {
    // systemd-inhibit may not be available
  }

  return false
}

export class MacOSIdleTimeProvider implements IdleTimeProvider {
  readonly name = 'macOS (ioreg + pmset)'

  getIdleSeconds(): number {
    const output = execSync(
      "ioreg -c IOHIDSystem | awk '/HIDIdleTime/ {print int($NF/1000000000)}'",
      EXEC_OPTIONS
    )
    let idleSec = Number.parseInt(output.trim(), 10) || 0

    // If physically idle, check if there's a software assertion keeping the display awake (e.g. video playback, video call)
    if (idleSec >= INHIBITION_CHECK_THRESHOLD_SEC) {
      const pmsetOutput = execSync('pmset -g assertions', EXEC_OPTIONS)
      if (/PreventUserIdleDisplaySleep\s+1/.test(pmsetOutput)) {
        // Treat as fully active
        idleSec = 0
      }
    }

    return idleSec
  }
}

const LINUX_BACKENDS: readonly LinuxIdleBackend[] = [
  {
    name: 'GNOME Mutter D-Bus',
    readIdleSeconds: () => {
      const output = execSync(
        'gdbus call --session --dest org.gnome.Mutter.IdleMonitor --object-path /org/gnome/Mutter/IdleMonitor/Core --method org.gnome.Mutter.IdleMonitor.GetIdletime',
        EXEC_OPTIONS
      )
      return parseDBusIdleSeconds(output)
    },
  },
  {
    name: 'Freedesktop ScreenSaver D-Bus',
    readIdleSeconds: () => {
      const output = execSync(
        'gdbus call --session --dest org.freedesktop.ScreenSaver --object-path /org/freedesktop/ScreenSaver --method org.freedesktop.ScreenSaver.GetSessionIdleTime',
        EXEC_OPTIONS
      )
      return parseDBusIdleSeconds(output)
    },
  },
  {
    name: 'xprintidle (X11)',
    readIdleSeconds: () => {
      const output = execSync('xprintidle', EXEC_OPTIONS)
      return parseXprintidleSeconds(output)
    },
  },
]

export class LinuxIdleTimeProvider implements IdleTimeProvider {
  readonly name: string
  private readonly backend: LinuxIdleBackend

  constructor(backend: LinuxIdleBackend) {
    this.backend = backend
    this.name = `Linux (${backend.name})`
  }

  static probe(): LinuxIdleTimeProvider | null {
    for (const backend of LINUX_BACKENDS) {
      try {
        backend.readIdleSeconds()
        logger.log(`Detected Linux idle time backend: ${backend.name}`)
        return new LinuxIdleTimeProvider(backend)
      } catch {
        // Backend unavailable or failed; try next candidate
      }
    }

    logger.warn(
      'No supported Linux idle-time backend available (tried GNOME Mutter D-Bus, Freedesktop ScreenSaver D-Bus, and xprintidle). Ensure a graphical desktop session with gdbus or xprintidle is available. Active time triggers will not poll.'
    )
    return null
  }

  getIdleSeconds(): number {
    let idleSec = this.backend.readIdleSeconds()

    if (idleSec >= INHIBITION_CHECK_THRESHOLD_SEC && isLinuxIdleInhibited()) {
      idleSec = 0
    }

    return idleSec
  }
}

export function createIdleTimeProvider(
  platform: NodeJS.Platform = process.platform
): IdleTimeProvider | null {
  if (platform === 'darwin') {
    return new MacOSIdleTimeProvider()
  }
  if (platform === 'linux') {
    return LinuxIdleTimeProvider.probe()
  }

  logger.warn(
    `ActiveTimeTriggerManager is not supported on platform "${platform}".`
  )
  return null
}

export class ActiveTimeTriggerManager implements TriggerManager {
  private readonly workflows = new Map<
    string,
    {
      workflow: Workflow
      activeSeconds: number
      onTick: (w: Workflow) => Promise<void>
    }
  >()

  private intervalHandle: ReturnType<typeof setInterval> | null = null
  private idleProvider: IdleTimeProvider | null | undefined = undefined
  private readonly POLL_INTERVAL_MS = 5000

  register(workflow: Workflow, onTick: (w: Workflow) => Promise<void>): void {
    if (workflow.trigger.type !== 'active_time') return

    logger.log(
      `Registering active_time trigger for workflow "${workflow.name}" <${workflow.id}>`
    )

    this.workflows.set(workflow.id, {
      workflow,
      activeSeconds: 0,
      onTick,
    })

    this.startPollingIfNeeded()
  }

  unregister(workflowId: string): void {
    if (this.workflows.delete(workflowId)) {
      if (this.workflows.size === 0 && this.intervalHandle) {
        clearInterval(this.intervalHandle)
        this.intervalHandle = null
        logger.log('No more active_time workflows. Polling stopped.')
      }
    }
  }

  stopAll(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
    }
    this.workflows.clear()
    this.idleProvider = undefined
  }

  getTriggerState(workflowId: string): Record<string, unknown> | null {
    const state = this.workflows.get(workflowId)
    if (!state) return null
    if (state.workflow.trigger.type !== 'active_time') return null

    return {
      activeSeconds: state.activeSeconds,
      duration: state.workflow.trigger.duration,
      progressPercentage: Math.round(
        (state.activeSeconds / state.workflow.trigger.duration) * 100
      ),
    }
  }

  private startPollingIfNeeded(): void {
    if (this.intervalHandle) return

    if (this.idleProvider === undefined) {
      this.idleProvider = createIdleTimeProvider()
    }
    if (!this.idleProvider) {
      return
    }

    logger.log(
      `Starting idle time polling loop using ${this.idleProvider.name} (every ${this.POLL_INTERVAL_MS / 1000}s).`
    )
    this.intervalHandle = setInterval(() => this.poll(), this.POLL_INTERVAL_MS)
  }

  private poll(): void {
    if (!this.idleProvider) return

    let idleSec = 0
    try {
      idleSec = this.idleProvider.getIdleSeconds()
    } catch (err) {
      logger.error('Error fetching idle time/assertions:', err)
      return
    }

    const pollIntervalSec = this.POLL_INTERVAL_MS / 1000

    for (const [id, state] of this.workflows.entries()) {
      const trigger = state.workflow.trigger
      if (trigger.type !== 'active_time') continue

      const idleLimit = trigger.idleLimit ?? 60
      const resetLimit = trigger.resetLimit ?? 300

      if (idleSec > resetLimit) {
        if (state.activeSeconds > 0) {
          logger.log(
            `[RESET] Workflow "${state.workflow.name}" - Away for >${resetLimit}s. Resetting accumulated active time (was ${state.activeSeconds}s).`
          )
          state.activeSeconds = 0
        }
      } else if (idleSec < idleLimit) {
        state.activeSeconds += pollIntervalSec

        if (state.activeSeconds >= trigger.duration) {
          logger.log(
            `[TRIGGER] Workflow "${state.workflow.name}" active time limit (${trigger.duration}s) reached!`
          )
          state.activeSeconds = 0

          // Execute onTick without awaiting to not block the loop
          state.onTick(state.workflow).catch((err) => {
            logger.error(`Error executing active_time trigger for ${id}:`, err)
          })
        }
      }
    }
  }
}
