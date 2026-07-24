import notifier from 'node-notifier'
import { Logger } from '@melledijkstra/toolbox'
import type { ActionContext } from '../types/actions.ts'

const logger = new Logger('Action:SendNotification')

export async function sendNotification(
  ctx: ActionContext,
  message: string,
  title?: string
): Promise<void> {
  const notificationTitle = title || `Looper: ${ctx.taskName}`
  try {
    logger.log(`Sending notification for task "${ctx.taskName}"...`)

    notifier.notify(
      {
        title: notificationTitle,
        message: message,
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
  } catch (err: any) {
    logger.error(`Failed to send notification: ${err.message}`, err)
    throw new Error(`Failed to send notification: ${err.message}`)
  }
}
