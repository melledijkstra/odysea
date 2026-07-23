import cron, { type ScheduledTask as CronTask } from 'node-cron'
import { Logger } from '@melledijkstra/toolbox'
import { type ScheduledTask } from './task.js'

const logger = new Logger('TaskScheduler')

/**
 * Manages the lifecycle of all registered tasks:
 *  - Schedules each task via node-cron
 *  - Runs a startup catch-up check for each task
 *  - Exposes scheduled cron handles for status queries
 */
export class TaskScheduler {
  /** Map from task id → live cron handle */
  private readonly cronHandles = new Map<string, CronTask>()

  constructor(
    private readonly tasks: ScheduledTask[],
    private readonly port: number | string
  ) {}

  /**
   * Starts all registered tasks.
   * Call this once after the Express server is listening.
   */
  start(): void {
    for (const task of this.tasks) {
      this.startupCatchupCheck(task)
      this.schedule(task)
    }
  }

  /**
   * Returns the cron handle for a given task id, or undefined if not found.
   */
  getCronHandle(taskId: string): CronTask | undefined {
    return this.cronHandles.get(taskId)
  }

  /**
   * Returns a snapshot of all registered tasks for use in status routes.
   */
  getTasks(): ReadonlyArray<ScheduledTask> {
    return this.tasks
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private schedule(task: ScheduledTask): void {
    logger.log(
      `Scheduling task "${task.name}" <${task.id}> with cron: ${task.cronExpression}`
    )

    const handle = cron.schedule(
      task.cronExpression,
      () => this.onCronTick(task),
      process.env['TZ'] ? { timezone: process.env['TZ'] } : undefined
    )

    this.cronHandles.set(task.id, handle)
  }

  private async onCronTick(task: ScheduledTask): Promise<void> {
    logger.log(`Cron tick for task "${task.name}" [${task.id}].`)

    const lastRun = task.getLastExecutedTimestamp()
    const now = Date.now()

    if (!lastRun) {
      logger.log(
        `<${task.id}> No previous execution found. Performing initial execution.`
      )
      await task.execute({
        reason: 'Cron Scheduled Run (Initial)',
        port: this.port,
      })
      return
    }

    const elapsed = now - lastRun
    const tolerance = 5_000 // 5-second tolerance for timing jitter
    const missedRuns = Math.floor(elapsed / task.intervalMs)

    if (missedRuns > 1) {
      logger.warn(
        `<${task.id}> Missed execution(s) detected! ` +
          `Last run was ${Math.round(elapsed / 1000 / 60)} minutes ago. Missed count: ${missedRuns - 1}`
      )
      await task.execute({
        reason: 'Cron Scheduled Run (Recovering from missed run)',
        port: this.port,
      })
    } else if (elapsed >= task.intervalMs - tolerance) {
      logger.log(`<${task.id}> Scheduled time reached. Executing task.`)
      await task.execute({ reason: 'Cron Scheduled Run', port: this.port })
    } else {
      logger.log(
        `<${task.id}> Skipping execution: task was already run ` +
          `${Math.round(elapsed / 1000)} seconds ago (likely via webhook or manual trigger).`
      )
    }
  }

  private async startupCatchupCheck(task: ScheduledTask): Promise<void> {
    logger.log(
      `Running startup catch-up check for task "${task.name}" <${task.id}>...`
    )

    const lastRun = task.getLastExecutedTimestamp()
    const now = Date.now()

    if (!lastRun) {
      logger.log(
        `<${task.id}> No previous execution found. Performing startup initial run.`
      )
      await task.execute({ reason: 'Startup Initial Run', port: this.port })
      return
    }

    const elapsed = now - lastRun

    if (elapsed >= task.intervalMs) {
      logger.log(
        `<${task.id}> Missed execution detected at startup! ` +
          `Last run was ${Math.round(elapsed / 1000 / 60)} minutes ago. Triggering catch-up task.`
      )
      await task.execute({ reason: 'Startup Catch-up Run', port: this.port })
    } else {
      logger.log(
        `<${task.id}> Task was run recently ` +
          `(${Math.round(elapsed / 1000)} seconds ago). No catch-up needed.`
      )
    }
  }
}
