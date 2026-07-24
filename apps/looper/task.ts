import { Logger } from '@melledijkstra/toolbox'
import {
  getLastExecutedTimestamp,
  updateLastExecutedTimestamp,
} from './database.js'
import type { TaskExecutionContext, TaskResult } from './types/tasks.ts'

/**
 * Abstract base class for all scheduled tasks.
 *
 * Subclasses must implement:
 *  - `id`       – unique, stable string identifier stored in the database
 *  - `name`     – human-readable display name
 *  - `cronExpression` – node-cron compatible expression
 *  - `intervalMs`     – expected minimum interval between executions (for catch-up logic)
 *  - `run(ctx)` – the actual task logic
 */
export abstract class ScheduledTask {
  abstract readonly id: string
  abstract readonly name: string
  /**
   * The cron expression is made of five fields. Each field can have the following values.
   *
   *  minute (0-59)
   *  hour (0 - 23)
   *  day of the month (1 - 31)
   *  month (1 - 12)
   *  day of the week (0 - 6)
   *
   *  Here are some examples:
   *  Cron expression    Schedule
   *      * * * * *      Every minute
   *      0 * * * *      Every hour
   *      0 0 * * *      Every day at 12:00 AM
   *      0 0 * * FRI    At 12:00 AM, only on Friday
   *      0 0 1 * *      At 12:00 AM, on day 1 of the month
   */
  abstract readonly cronExpression: string
  /** Minimum expected ms between executions – used for missed-run detection. */
  abstract readonly intervalMs: number

  /**
   * Wraps `run` with standard logging and database persistence.
   * Do NOT override this method – override `run` instead.
   */
  async execute(ctx: TaskExecutionContext): Promise<void> {
    const log = new Logger(this.id)
    log.log(`Starting execution of "${this.name}" (Reason: ${ctx.reason})...`)

    let status = 'FAILED'

    try {
      ;({ status } = await this.run(ctx))
    } catch (error: any) {
      log.error('Unhandled error during execution:', error)
      status = 'FAILED'
    }

    const now = Date.now()
    updateLastExecutedTimestamp(this.id, now, status, this.name)
    log.log(
      `Completed execution of "${this.name}". Status: ${status}. Database updated.`
    )
  }

  /**
   * Implement the actual task work here.
   * @returns An object with:
   *   - `status` – `'SUCCESS'` or `'FAILED'` (persisted to the database)
   *   - `details` – human-readable description of what happened (for logging purposes)
   */
  protected abstract run(ctx: TaskExecutionContext): Promise<TaskResult>

  /** Retrieve the last execution timestamp from the database. */
  getLastExecutedTimestamp(): number | null {
    return getLastExecutedTimestamp(this.id)
  }
}
