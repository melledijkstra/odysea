import { exec } from 'child_process'
import { promisify } from 'util'
import { Logger } from '@melledijkstra/toolbox'
import type { ActionContext } from '../types/actions.ts'

const execAsync = promisify(exec)
const logger = new Logger('MacNotification')

export async function sendMacNotification(
  ctx: ActionContext,
  message: string,
  title?: string
): Promise<void> {
  const notificationTitle = title || `Looper: ${ctx.taskName}`
  try {
    logger.log(`Sending mac notification for task "${ctx.taskName}"...`)

    const safeTitle = notificationTitle.replace(/"/g, '\\"')
    const safeMessage = message.replace(/"/g, '\\"')

    await execAsync(
      `osascript -e 'display notification "${safeMessage}" with title "${safeTitle}"'`
    )

    logger.log('Mac notification sent successfully.')
  } catch (err: any) {
    logger.error(`Failed to send mac notification: ${err.message}`, err)
    throw new Error(`Failed to send mac notification: ${err.message}`)
  }
}
