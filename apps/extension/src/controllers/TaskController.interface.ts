import type { Task, TaskList } from '@/interfaces/tasks'

export type TaskControllerInterface = {
  canCreateTask: boolean
  defaultListId: string
  getTasks: (taskListId?: string) => Promise<Task[]>
  getTaskLists: () => Promise<TaskList[]>
  createTask: (taskTitle: string, taskListId?: string) => Promise<boolean>
  setTaskStatus: (
    taskId: string,
    status: boolean,
    taskListId?: string
  ) => Promise<boolean>
  deleteTask: (taskId: string, taskListId?: string) => Promise<boolean>
  updateTask: (task: Task, taskListId?: string) => Promise<boolean>
  authenticate: () => Promise<boolean>
  isAuthenticated: () => Promise<boolean>
  isEnabled: () => Promise<boolean>
}
