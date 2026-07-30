import type { TaskExecutionContext } from './tasks.ts'

export interface ActionContext extends TaskExecutionContext {
  workflowName: string
  workflowId: string
}
