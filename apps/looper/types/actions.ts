import type { TaskExecutionContext } from './tasks.ts'

export interface ActionContext extends TaskExecutionContext {
  taskName: string
  taskId: string
}
