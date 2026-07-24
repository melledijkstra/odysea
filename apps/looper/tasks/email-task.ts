import { Logger } from '@melledijkstra/toolbox'
import { authClient } from '../google-auth.ts'
import { sendEmail } from '../actions/send-email.ts'
import { getUserInfo, type UserInfo } from '../actions/get-user-info.ts'
import type { ActionContext } from '../actions/index.ts'
import { ScheduledTask } from '../task.ts'
import type { TaskExecutionContext, TaskResult } from '../types/tasks.ts'

const logger = new Logger('EmailTask')

/**
 * EmailTask — demonstrates the pattern for a concrete scheduled task.
 *
 * On execution it:
 *  1. Authenticates with Google
 *  2. Fetches the authenticated user's info
 *  3. Sends a notification email via Gmail
 */
export class EmailTask extends ScheduledTask {
  readonly id = 'email-task'
  readonly name = 'Email Task'
  readonly cronExpression = '0 8 * * *' // Every day at 08:00
  readonly intervalMs = 15 * 60 * 1000 // 15 minutes (used for catch-up detection)

  protected async run(ctx: TaskExecutionContext): Promise<TaskResult> {
    const actionCtx: ActionContext = {
      ...ctx,
      taskName: this.name,
      taskId: this.id,
    }

    const token = await authClient.getAuthToken(false)

    if (!token) {
      logger.warn(
        `Google Auth token not found/expired. Visit http://localhost:${ctx.port}/auth/google to login.`
      )
      return {
        status: 'FAILED',
        details:
          'No active authentication session. Please visit /auth/google to authorize.',
      }
    }

    let userInfo: UserInfo
    try {
      userInfo = await getUserInfo(actionCtx, token)
    } catch (err: any) {
      return { status: 'FAILED', details: err.message }
    }
    const details = `Fetched user info: ${userInfo.name} (${userInfo.email})`
    logger.log(`Successfully retrieved user info: ${details}`)

    if (userInfo.email) {
      await sendEmail(actionCtx, userInfo, token)
    } else {
      logger.warn(
        'User email not found in userinfo response, skipping email sending.'
      )
    }

    return { status: 'SUCCESS', details }
  }
}
