import { Logger } from '@melledijkstra/toolbox'

const logger = new Logger('GetUserInfoAction')

export interface UserInfo {
  email?: string
  name?: string
}

import type { ActionContext } from '../types/actions.ts'

export async function getUserInfo(
  ctx: ActionContext,
  args: { token: string }
): Promise<UserInfo> {
  logger.log(`[${ctx.workflowName}] Fetching user info from Google...`)
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: { Authorization: `Bearer ${args.token}` },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    const details = `Google API returned error: ${response.status} ${errorText}`
    logger.error(`Google API error: ${details}`)
    throw new Error(details)
  }

  return (await response.json()) as UserInfo
}
