import notifier from 'node-notifier'
import { Logger } from '@melledijkstra/toolbox'
import type { ActionContext } from '../types/actions.ts'

const logger = new Logger('Action:SendNotification')

export async function sendNotification(
  ctx: ActionContext,
  args: { message: string; title?: string }
): Promise<void> {
  const notificationTitle = args.title || `Looper: ${ctx.workflowName}`
  try {
    logger.log(`Sending notification for workflow "${ctx.workflowName}"...`)

    notifier.notify(
      {
        title: notificationTitle,
        message: args.message,
        sound: true,
        wait: true,
      },
      (err, response, metadata) => {
        if (err) {
          logger.error(`Notification error: ${err.message}`, err)
        } else {
          logger.log(`Notification response: ${response}`, metadata)
        }
      }
    )

    logger.log('Notification sent successfully.')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`Failed to send notification: ${message}`, err)
    throw new Error(`Failed to send notification: ${message}`)
  }
}
