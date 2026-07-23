import { google } from 'googleapis'
import { Logger } from '@melledijkstra/toolbox'
import { authClient } from '../google-auth.js'
import {
  ScheduledTask,
  type TaskExecutionContext,
  type TaskResult,
} from '../task.js'

const logger = new Logger('MockTask')

/**
 * MockTask — demonstrates the pattern for a concrete scheduled task.
 *
 * On execution it:
 *  1. Authenticates with Google
 *  2. Fetches the authenticated user's info
 *  3. Sends a notification email via Gmail
 */
export class MockTask extends ScheduledTask {
  readonly id = 'mock-task'
  readonly name = 'Mock Task'
  readonly cronExpression = '0 8 * * *' // Every day at 08:00
  readonly intervalMs = 15 * 60 * 1000 // 15 minutes (used for catch-up detection)

  protected async run(ctx: TaskExecutionContext): Promise<TaskResult> {
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

    logger.log('Authenticated. Fetching user info from Google...')
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      const details = `Google API returned error: ${response.status} ${errorText}`
      logger.error(`Google API error: ${details}`)
      return { status: 'FAILED', details }
    }

    const userInfo = (await response.json()) as {
      email?: string
      name?: string
    }
    const details = `Fetched user info: ${userInfo.name} (${userInfo.email})`
    logger.log(`Successfully retrieved user info: ${details}`)

    if (userInfo.email) {
      await this.sendEmail(userInfo, token, ctx.reason)
    } else {
      logger.warn(
        'User email not found in userinfo response, skipping email sending.'
      )
    }

    return { status: 'SUCCESS', details }
  }

  private async sendEmail(
    userInfo: { email?: string; name?: string },
    token: string,
    reason: string
  ): Promise<void> {
    try {
      logger.log(`Sending email to ${userInfo.email}...`)
      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({ access_token: token })
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

      const subject = `Task Execution: ${this.name}`
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
      const messageParts = [
        `To: ${userInfo.email}`,
        `Subject: ${utf8Subject}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        `Hello ${userInfo.name || 'User'},\n\nThe scheduled task "${this.name}" was executed successfully.\nTrigger Reason: ${reason}\nExecution Time: ${new Date().toISOString()}\n\nBest,\nLooper`,
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
        `Email sent successfully to ${userInfo.email}. Message ID: ${gmailResponse.data.id}`
      )
    } catch (gmailError: any) {
      logger.error(`Failed to send email: ${gmailError.message}`, gmailError)
    }
  }
}
