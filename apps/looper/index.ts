import express from 'express'
import { Logger } from '@melledijkstra/toolbox'
import { authClient } from './google-auth.js'
import { WorkflowScheduler } from './scheduler.js'
import { WorkflowEngine } from './engine.js'
import { getLastExecutedTimestamp } from './database.js'
import { toHuman } from 'cron-translate'
import path from 'node:path'

const logger = new Logger('looper')

const app = express()
const cliPortIndex = process.argv.indexOf('--port')
const PORT =
  (cliPortIndex !== -1 ? process.argv[cliPortIndex + 1] : null) ??
  process.env['PORT'] ??
  5050

app.use(express.json())

// ---------------------------------------------------------------------------
// Workflow registration
// Workflows are loaded dynamically from the workflows/ directory.
// ---------------------------------------------------------------------------
const workflowsDir = path.resolve('workflows')
const scheduler = new WorkflowScheduler(workflowsDir)

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
// Workflow routes
// ---------------------------------------------------------------------------

/**
 * Webhook endpoint — triggers a specific workflow.
 * POST /webhook
 */
app.post('/webhook', (req, res) => {
  logger.log('Webhook endpoint triggered.')
  const { workflowId } = req.body

  if (!workflowId) {
    res.status(400).json({ success: false, message: 'workflowId is required' })
    return
  }

  const workflows = scheduler.getWorkflows()
  const workflow = workflows.find((w) => w.id === workflowId)

  if (!workflow) {
    res.status(404).json({ success: false, message: 'Workflow not found' })
    return
  }

  if (workflow.trigger.type !== 'webhook') {
    res.status(400).json({
      success: false,
      message: 'Workflow is not configured for webhook trigger',
    })
    return
  }

  // Execute workflow without awaiting
  WorkflowEngine.execute(workflow, 'Webhook Trigger').catch((err) => {
    logger.error(`Webhook execution error for ${workflowId}:`, err)
  })

  res.status(200).json({
    success: true,
    message: `Workflow ${workflowId} triggered via webhook.`,
    timestamp: Date.now(),
  })
})

/**
 * Status endpoint — returns execution state for all registered workflows.
 * GET /status
 */
app.get('/status', async (_req, res) => {
  const authenticated = await authClient.isAuthenticated()
  const now = Date.now()

  const workflowStatuses = scheduler.getWorkflows().map((workflow) => {
    const lastRun = getLastExecutedTimestamp(workflow.id)
    const nextRunAt = scheduler.getCronManager().getNextRunTime(workflow)

    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      lastExecutedAt: lastRun ? new Date(lastRun).toISOString() : null,
      lastExecutedTimestamp: lastRun,
      elapsedMs: lastRun ? now - lastRun : null,
      status: lastRun ? 'Active' : 'Never Executed',
      trigger: {
        ...workflow.trigger,
        ...(workflow.trigger.type === 'cron' && {
          human: toHuman(workflow.trigger.expression),
        }),
      },
      nextRunAt,
    }
  })

  res.status(200).json({
    workflows: workflowStatuses,
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
