import { ScheduledTask } from '../task.js'
import { sendNotification, type ActionContext } from '../actions/index.js'
import type { TaskExecutionContext, TaskResult } from '../types/tasks.js'

export class NotificationTask extends ScheduledTask {
  readonly id = 'notification-task'
  readonly name = 'Notification Task'
  readonly cronExpression = '0 8 * * *' // Once at 8 am
  readonly intervalMs = 24 * 60 * 60 * 1000 // 24 hours

  protected async run(ctx: TaskExecutionContext): Promise<TaskResult> {
    const actionCtx: ActionContext = {
      ...ctx,
      taskName: this.name,
      taskId: this.id,
    }

    try {
      await sendNotification(
        actionCtx,
        `Hello! This is your reminder. Reason: ${ctx.reason}`
      )
      return { status: 'SUCCESS', details: 'Notification sent' }
    } catch (err: any) {
      return { status: 'FAILED', details: err.message }
    }
  }
}
