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

export class WorkflowScheduler {
  private readonly workflows = new Map<string, Workflow>()
  private readonly cronHandles = new Map<string, CronTask>()
  private watcher: chokidar.FSWatcher | null = null

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

    if (workflow.trigger.type === 'cron') {
      this.checkMissedExecution(workflow)
      this.scheduleCron(workflow)
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

  private unregisterWorkflow(workflowId: string): void {
    const handle = this.cronHandles.get(workflowId)
    if (handle) {
      handle.stop()
      this.cronHandles.delete(workflowId)
    }
    this.workflows.delete(workflowId)
  }

  private removeWorkflow(filePath: string): void {
    const id = path.basename(filePath, path.extname(filePath))
    logger.log(`Removing workflow: ${id}`)
    this.unregisterWorkflow(id)
  }

  private scheduleCron(workflow: Workflow): void {
    if (workflow.trigger.type !== 'cron') return

    logger.log(
      `Scheduling workflow "${workflow.name}" <${workflow.id}> with cron: ${workflow.trigger.expression}`
    )

    const handle = cron.schedule(
      workflow.trigger.expression,
      () => this.onCronTick(workflow),
      process.env['TZ'] ? { timezone: process.env['TZ'] } : undefined
    )

    this.cronHandles.set(workflow.id, handle)
  }

  private async onCronTick(workflow: Workflow): Promise<void> {
    logger.log(`Cron tick for workflow "${workflow.name}" [${workflow.id}].`)
    await WorkflowEngine.execute(workflow, 'Cron Scheduled Run')
  }

  getCronHandle(workflowId: string): CronTask | undefined {
    return this.cronHandles.get(workflowId)
  }

  getWorkflows(): ReadonlyArray<Workflow> {
    return Array.from(this.workflows.values())
  }
}
