import { google } from 'googleapis'
import { Logger } from '@melledijkstra/toolbox'

const logger = new Logger('SendEmailAction')

import type { ActionContext } from '../types/actions.ts'

export async function sendEmail(
  ctx: ActionContext,
  args: { userInfo: { email?: string; name?: string }; token: string }
): Promise<void> {
  try {
    logger.log(`Sending email to ${args.userInfo.email}...`)
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: args.token })
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    const subject = `Task Execution: ${ctx.taskName}`
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
    const messageParts = [
      `To: ${args.userInfo.email}`,
      `Subject: ${utf8Subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      `Hello ${args.userInfo.name || 'User'},\n\nThe scheduled task "${ctx.taskName}" was executed successfully.\nTrigger Reason: ${ctx.reason}\nExecution Time: ${new Date().toISOString()}\n\nBest,\nLooper`,
    ]

    const encodedMessage = Buffer.from(messageParts.join('\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const gmailResponse = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    })

    logger.log(
      `Email sent successfully to ${args.userInfo.email}. Message ID: ${gmailResponse.data.id}`
    )
  } catch (gmailError: unknown) {
    const message = gmailError instanceof Error ? gmailError.message : String(gmailError)
    logger.error(`Failed to send email: ${message}`, gmailError)
  }
}
