import { Logger } from '@melledijkstra/toolbox'
import type { Workflow } from './types/workflow.js'
import { actionRegistry } from './actions/registry.js'
import type { ActionContext } from './types/actions.js'
import { updateLastExecutedTimestamp } from './database.js'

const logger = new Logger('WorkflowEngine')

export class WorkflowEngine {
  static interpolate(
    value: unknown,
    context: Record<string, unknown>
  ): unknown {
    if (typeof value === 'string') {
      const exactMatch = /^\s*\{\{\s*([\w.]+)\s*\}\}\s*$/.exec(value)
      if (exactMatch) {
        return this.resolvePath(exactMatch[1] as string, context)
      }

      const regex = /\{\{\s*([\w.]+)\s*\}\}/g
      return value.replace(regex, (match, path) => {
        const resolved = this.resolvePath(path, context)
        return resolved !== undefined ? String(resolved) : match
      })
    } else if (Array.isArray(value)) {
      return value.map((v) => this.interpolate(v, context))
    } else if (typeof value === 'object' && value !== null) {
      const interpolated: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value)) {
        interpolated[k] = this.interpolate(v, context)
      }
      return interpolated
    }
    return value
  }

  static resolvePath(path: string, obj: unknown): unknown {
    return path
      .split('.')
      .reduce(
        (acc, part) =>
          (acc as Record<string, unknown>) &&
          (acc as Record<string, unknown>)[part],
        obj
      )
  }

  static async execute(workflow: Workflow, triggerReason: string) {
    logger.log(`Starting workflow: ${workflow.name} (${workflow.id})`)
    const context: Record<string, unknown> = {}

    const actionCtx: ActionContext = {
      workflowName: workflow.name,
      workflowId: workflow.id,
      reason: triggerReason,
      port: process.env['PORT'] || 5050,
    }

    let status = 'SUCCESS'

    try {
      for (const step of workflow.steps) {
        logger.log(`Executing step: ${step.id} (${step.action})`)
        const actionFunction = actionRegistry[step.action]
        if (!actionFunction) {
          throw new Error(`Action not found in registry: ${step.action}`)
        }

        const interpolatedArgs = this.interpolate(
          step.args || {},
          context
        ) as Record<string, unknown>
        const result = await actionFunction(actionCtx, interpolatedArgs)

        context[step.id] = { output: result }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error(`Error in workflow ${workflow.id}: ${message}`)
      status = 'FAILED'
    }

    updateLastExecutedTimestamp(workflow.id, Date.now(), status, workflow.name)
    logger.log(`Workflow ${workflow.id} completed with status: ${status}.`)
  }
}
