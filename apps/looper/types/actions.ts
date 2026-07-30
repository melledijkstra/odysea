import type { WorkflowExecutionContext } from './workflow.ts'

export interface ActionContext extends WorkflowExecutionContext {
  workflowName: string
  workflowId: string
}
