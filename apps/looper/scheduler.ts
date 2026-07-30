import cron, { type ScheduledTask as CronTask } from 'node-cron'
import { CronExpressionParser } from 'cron-parser'
import { Logger } from '@melledijkstra/toolbox'
import chokidar from 'chokidar'
import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'
import { WorkflowEngine } from './engine.js'
import { getLastExecutedTimestamp } from './database.js'
import type { Workflow } from './types/workflow.js'

const logger = new Logger('WorkflowScheduler')

export class CronTriggerManager {
  private readonly cronHandles = new Map<string, CronTask>()

  register(workflow: Workflow, onTick: (w: Workflow) => Promise<void>): void {
    if (workflow.trigger.type !== 'cron') return

    this.checkMissedExecution(workflow)
    
    logger.log(
      `Scheduling workflow "${workflow.name}" <${workflow.id}> with cron: ${workflow.trigger.expression}`
    )
    const handle = cron.schedule(
      workflow.trigger.expression,
      () => onTick(workflow),
      process.env['TZ'] ? { timezone: process.env['TZ'] } : undefined
    )
    this.cronHandles.set(workflow.id, handle)
  }

  unregister(workflowId: string): void {
    const handle = this.cronHandles.get(workflowId)
    if (handle) {
      handle.stop()
      this.cronHandles.delete(workflowId)
    }
  }

  catchUpMissedExecutions(workflows: Iterable<Workflow>): void {
    for (const workflow of workflows) {
      if (workflow.trigger.type === 'cron') {
        this.checkMissedExecution(workflow)
      }
    }
  }

  private checkMissedExecution(workflow: Workflow): void {
    if (workflow.trigger.type !== 'cron') return

    try {
      const lastExecutedTimestamp = getLastExecutedTimestamp(workflow.id) || 0

      const interval = CronExpressionParser.parse(
        workflow.trigger.expression,
        process.env['TZ'] ? { tz: process.env['TZ'] } : undefined
      )

      const expectedPrevRun = interval.prev().toDate().getTime()

      if (expectedPrevRun > lastExecutedTimestamp) {
        logger.log(
          `Workflow "${workflow.name}" [${workflow.id}] missed its scheduled run at ${new Date(expectedPrevRun).toISOString()}. Executing now.`
        )
        // Execute without awaiting to not block the scheduler
        WorkflowEngine.execute(workflow, 'Catch-up Cron Scheduled Run').catch(
          (err) => {
            logger.error(
              `Error during catch-up execution for workflow ${workflow.id}:`,
              err
            )
          }
        )
      }
    } catch (error) {
      logger.error(
        `Failed to check missed execution for workflow ${workflow.id}:`,
        error
      )
    }
  }

  stopAll(): void {
    for (const handle of this.cronHandles.values()) {
      handle.stop()
    }
    this.cronHandles.clear()
  }

  getNextRunTime(workflow: Workflow): string | null {
    if (workflow.trigger.type !== 'cron') return null
    const handle = this.cronHandles.get(workflow.id)
    if (!handle) return null

    try {
      // @ts-ignore - Some versions of node-cron have this undocumented method
      const nextRun = handle.getNextRun ? handle.getNextRun() : undefined
      if (nextRun instanceof Date) {
        return nextRun.toString()
      } else if (nextRun && typeof nextRun === 'object' && 'toDate' in nextRun) {
        return (nextRun as { toDate: () => Date }).toDate().toString()
      } else if (nextRun) {
        return new Date(nextRun as unknown as string | number).toString()
      }
    } catch (err) {
      logger.error(
        `Error getting next run time for workflow "${workflow.id}":`,
        err
      )
    }
    return null
  }
}

export class WorkflowScheduler {
  private readonly workflows = new Map<string, Workflow>()
  private readonly cronManager = new CronTriggerManager()
  private watcher: chokidar.FSWatcher | null = null
  private lastCheckTime = Date.now()
  private clockDriftInterval: ReturnType<typeof setInterval> | null = null
  private readonly CHECK_INTERVAL = 10_000 // 10 seconds
  private readonly DRIFT_THRESHOLD = 30_000 // 30 seconds

  constructor(private readonly workflowsDir: string) {}

  start(): void {
    logger.log(`Starting WorkflowScheduler, watching: ${this.workflowsDir}`)

    if (!fs.existsSync(this.workflowsDir)) {
      fs.mkdirSync(this.workflowsDir, { recursive: true })
    }

    this.watcher = chokidar.watch(this.workflowsDir, {
      persistent: true,
      ignoreInitial: false,
    })

    this.watcher
      .on('add', (filePath) => this.handleFileEvent(filePath))
      .on('change', (filePath) => this.handleFileEvent(filePath))
      .on('unlink', (filePath) => this.removeWorkflow(filePath))

    this.startClockDriftDetection()
  }

  stop(): void {
    logger.log('Stopping WorkflowScheduler...')

    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }

    this.cronManager.stopAll()

    if (this.clockDriftInterval) {
      clearInterval(this.clockDriftInterval)
      this.clockDriftInterval = null
    }
  }

  private startClockDriftDetection(): void {
    this.lastCheckTime = Date.now()
    this.clockDriftInterval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - this.lastCheckTime

      if (elapsed > this.DRIFT_THRESHOLD) {
        logger.log(
          `Sleep/Wake detected! Clock drift of ${Math.round(
            elapsed / 1000
          )}s exceeded threshold. Catching up missed workflows...`
        )
        this.cronManager.catchUpMissedExecutions(this.workflows.values())
      }

      this.lastCheckTime = now
    }, this.CHECK_INTERVAL)
  }

  private handleFileEvent(filePath: string): void {
    if (!filePath.endsWith('.yml') && !filePath.endsWith('.yaml')) return

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const parsed = yaml.load(fileContent) as Record<string, unknown>
      if (
        !parsed ||
        !parsed['name'] ||
        !parsed['trigger'] ||
        !parsed['steps']
      ) {
        logger.error(
          `Invalid workflow file (missing required fields): ${filePath}`
        )
        return
      }

      const id =
        (parsed['id'] as string) ||
        path.basename(filePath, path.extname(filePath))
      const workflow: Workflow = {
        ...parsed,
        id,
      } as unknown as Workflow

      this.registerWorkflow(workflow)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error(`Error loading workflow ${filePath}: ${message}`)
    }
  }

  private registerWorkflow(workflow: Workflow): void {
    this.unregisterWorkflow(workflow.id)

    this.workflows.set(workflow.id, workflow)
    logger.log(`Registered workflow: ${workflow.name} [${workflow.id}]`)

    this.cronManager.register(workflow, async (w) => {
      logger.log(`Cron tick for workflow "${w.name}" [${w.id}].`)
      await WorkflowEngine.execute(w, 'Cron Scheduled Run')
    })
  }

  private unregisterWorkflow(workflowId: string): void {
    this.cronManager.unregister(workflowId)
    this.workflows.delete(workflowId)
  }

  private removeWorkflow(filePath: string): void {
    const id = path.basename(filePath, path.extname(filePath))
    logger.log(`Removing workflow: ${id}`)
    this.unregisterWorkflow(id)
  }

  getWorkflows(): ReadonlyArray<Workflow> {
    return Array.from(this.workflows.values())
  }
  
  getCronManager(): CronTriggerManager {
    return this.cronManager
  }
}
