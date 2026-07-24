import express from 'express'
import { Logger } from '@melledijkstra/toolbox'
import { authClient } from './google-auth.js'
import { TaskScheduler } from './scheduler.js'
import { EmailTask, NotificationTask } from './tasks/index.js'

const logger = new Logger('looper')

const app = express()
const cliPortIndex = process.argv.indexOf('--port')
const PORT =
  (cliPortIndex !== -1 ? process.argv[cliPortIndex + 1] : null) ??
  process.env['PORT'] ??
  5050

app.use(express.json())

// ---------------------------------------------------------------------------
// Task registration
// Add new tasks here – each task controls its own id, name, cron, and logic.
// ---------------------------------------------------------------------------
const scheduler = new TaskScheduler(
  [
    new EmailTask(),
    new NotificationTask(),
    // new AnotherTask(),
  ],
  PORT
)

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------

/** Initiates the Google OAuth2 flow. */
app.get('/auth/google', async (_req, res) => {
  try {
    const authUrl = await authClient.createAuthUrl()
    if (!authUrl) {
      res.status(500).send('Failed to generate Google auth URL')
      return
    }
    res.redirect(authUrl.href)
  } catch (error) {
    logger.error('Error starting Google auth:', error)
    res.status(500).send('Error starting Google auth')
  }
})

/** OAuth2 redirect callback. */
app.get('/oauth/callback', async (req, res) => {
  const code = req.query['code'] as string
  const state = req.query['state'] as string

  if (!code || !state) {
    res.status(400).send('Missing code or state')
    return
  }

  try {
    const tokens = await authClient.validate(code, state)
    const refreshToken = tokens.hasRefreshToken() ? tokens.refreshToken() : ''
    await authClient.cacheAuthToken(
      tokens.accessToken(),
      refreshToken,
      tokens.accessTokenExpiresInSeconds()
    )
    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h1 style="color: #2e7d32;">Authentication Successful!</h1>
          <p>Google authentication has been successfully set up and tokens are saved.</p>
          <p>You can now close this tab.</p>
          <a href="/status" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">Check Server Status</a>
        </body>
      </html>
    `)
  } catch (error) {
    logger.error('Error validating Google auth code:', error)
    res.status(500).send('Authentication failed')
  }
})

// ---------------------------------------------------------------------------
// Task routes
// ---------------------------------------------------------------------------

/**
 * Webhook endpoint — triggers all registered tasks immediately.
 * POST /webhook
 */
app.post('/webhook', (_req, res) => {
  logger.log('Webhook endpoint triggered.')

  const tasks = scheduler.getTasks()
  for (const task of tasks) {
    task.execute({ reason: 'Webhook Trigger', port: PORT })
  }

  res.status(200).json({
    success: true,
    message: `${tasks.length} task(s) triggered via webhook.`,
    tasks: tasks.map((t) => t.id),
    timestamp: Date.now(),
  })
})

/**
 * Status endpoint — returns execution state for all registered tasks.
 * GET /status
 */
app.get('/status', async (_req, res) => {
  const authenticated = await authClient.isAuthenticated()
  const now = Date.now()

  const taskStatuses = scheduler.getTasks().map((task) => {
    const lastRun = task.getLastExecutedTimestamp()
    const cronHandle = scheduler.getCronHandle(task.id)

    let nextRunAt: string | null = null
    if (cronHandle) {
      try {
        const nextRun = cronHandle.getNextRun()
        if (nextRun instanceof Date) {
          nextRunAt = nextRun.toISOString()
        } else if (nextRun) {
          nextRunAt = new Date(nextRun).toISOString()
        }
      } catch (err) {
        logger.error(`Error getting next run time for task "${task.id}":`, err)
      }
    }

    return {
      taskId: task.id,
      taskName: task.name,
      lastExecutedAt: lastRun ? new Date(lastRun).toISOString() : null,
      lastExecutedTimestamp: lastRun,
      elapsedMs: lastRun ? now - lastRun : null,
      status: lastRun ? 'Active' : 'Never Executed',
      cronSchedule: {
        expression: task.cronExpression,
        nextRunAt,
      },
    }
  })

  res.status(200).json({
    tasks: taskStatuses,
    googleAuth: {
      authenticated,
      authUrl: `http://localhost:${PORT}/auth/google`,
    },
  })
})

// ---------------------------------------------------------------------------
// Server startup
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  logger.log(`Webhook server listening on port ${PORT}`)
  scheduler.start()
})
