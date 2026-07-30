import type { ActionContext } from './actions.js'

export interface WorkflowTriggerCron {
  type: 'cron'
  expression: string
}

export interface WorkflowTriggerWebhook {
  type: 'webhook'
}

export type WorkflowTrigger = WorkflowTriggerCron | WorkflowTriggerWebhook

export interface WorkflowStep {
  id: string
  action: string
  args?: Record<string, unknown>
}

export interface Workflow {
  id: string
  name: string
  trigger: WorkflowTrigger
  steps: WorkflowStep[]
}

export type ActionFunction = (
  ctx: ActionContext,
  args: Record<string, unknown>
) => Promise<unknown> | unknown

export interface ActionRegistry {
  [actionName: string]: ActionFunction
}

export interface WorkflowExecutionContext {
  /** Human-readable reason for this execution (e.g. "Cron Scheduled Run", "Webhook Trigger") */
  reason: string
  /** Port the server is running on, useful for logging auth URLs */
  port: number | string
}

export interface WorkflowResult {
  status: 'SUCCESS' | 'FAILED'
  details: string
}
