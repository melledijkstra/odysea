import { sendEmail } from './send-email.js'
import { getUserInfo } from './get-user-info.js'
import { sendNotification } from './send-notification.js'
import type { ActionRegistry } from '../types/workflow.js'
import { authClient } from '../google-auth.js'

export const actionRegistry: ActionRegistry = {
  'google.sendEmail': async (ctx, args) => {
    const token = await authClient.getAuthToken()
    if (!token) throw new Error('Not authenticated with Google')
    return sendEmail(ctx, { ...(args as any), token })
  },
  'google.getUserInfo': async (ctx, args) => {
    const token = await authClient.getAuthToken()
    if (!token) throw new Error('Not authenticated with Google')
    return getUserInfo(ctx, { ...(args as any), token })
  },
  'system.notify': (ctx, args) =>
    sendNotification(ctx, args as { message: string; title?: string }),
}
