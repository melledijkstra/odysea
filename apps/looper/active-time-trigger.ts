import { Logger } from '@melledijkstra/toolbox'
import { execSync } from 'node:child_process'
import type { TriggerManager } from './scheduler.js'
import type { Workflow } from './types/workflow.js'

const logger = new Logger('ActiveTimeTriggerManager')

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
    if (process.platform !== 'darwin') {
      logger.error('ActiveTimeTriggerManager is only supported on macOS.')
      return
    }

    logger.log(
      `Starting idle time polling loop (every ${this.POLL_INTERVAL_MS / 1000}s).`
    )
    this.intervalHandle = setInterval(() => this.poll(), this.POLL_INTERVAL_MS)
  }

  private poll(): void {
    let idleSec = 0
    try {
      const output = execSync(
        "ioreg -c IOHIDSystem | awk '/HIDIdleTime/ {print int($NF/1000000000)}'",
        { encoding: 'utf8' }
      )
      idleSec = parseInt(output.trim(), 10) || 0
    } catch (err) {
      logger.error('Error fetching idle time from ioreg:', err)
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
