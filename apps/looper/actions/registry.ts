import { sendEmail } from './send-email.js'
import { getUserInfo } from './get-user-info.js'
import { sendNotification } from './send-notification.js'
import type { ActionRegistry } from '../types/workflow.js'
import type { ActionContext } from '../types/actions.js'
import { authClient } from '../google-auth.js'
import { config } from '../config.js'

export const actionRegistry: ActionRegistry = {
  'google.sendEmail': withGoogleAuth(sendEmail),
  'google.getUserInfo': withGoogleAuth(getUserInfo),
  'system.notify': (ctx, args) =>
    sendNotification(ctx, args as { message: string; title?: string }),
}

function withGoogleAuth<TArgs>(
  action: (
    ctx: ActionContext,
    args: TArgs & { token: string }
  ) => Promise<unknown>
) {
  return async (ctx: ActionContext, args: Record<string, unknown>) => {
    if (!authClient) {
      throw new Error(
        `Google authentication is not configured. Provide GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in ${config.paths.sharedSecretsFile}, ${config.paths.appEnvFile}, or environment variables.`
      )
    }
    const token = await authClient.getAuthToken()
    if (!token) throw new Error('Not authenticated with Google')
    return action(ctx, { ...args, token } as unknown as TArgs & {
      token: string
    })
  }
}
