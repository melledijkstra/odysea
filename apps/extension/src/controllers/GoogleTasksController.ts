import { GoogleTasksApiClient } from '@melledijkstra/api'
import type { ILogger } from '@/interfaces/logger.interface'
import { Logger } from '@/logger'
import { AuthClient } from '@melledijkstra/extension'
import { googleAuthClient } from '@/oauth2/clients'
import { addNotification } from '@/stores/notifications.svelte'
import type { Task, TaskList } from '@/interfaces/tasks'
import { TASKS_SCOPE } from '@/oauth2/scope-registry'

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
}

export class GoogleTasksController implements TaskControllerInterface, ILogger {
  canCreateTask = true
  defaultListId = '@default'
  logger: Logger
  public readonly auth: AuthClient
  private readonly api: GoogleTasksApiClient

  constructor() {
    this.logger = new Logger('GoogleTasksController')
    this.auth = googleAuthClient
    this.api = new GoogleTasksApiClient(this.auth)
  }

  async deleteTask(taskId: string, taskListId?: string): Promise<boolean> {
    const success = await this.api.deleteTask(taskId, taskListId)
    return success
  }

  async authenticate(): Promise<boolean> {
    return await this.auth.authenticate([TASKS_SCOPE])
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.auth.getAuthToken(false, [TASKS_SCOPE])
    return !!token
  }

  async initialize() {
    await this.isAuthenticated()
  }

  async getTaskLists(): Promise<TaskList[]> {
    const taskLists = await this.api.getTaskLists()
    return taskLists || []
  }

  async getTasks(taskListId?: string): Promise<Task[]> {
    try {
      const tasks = await this.api.fetchTasks(taskListId, false)
      return tasks || []
    } catch (error) {
      addNotification('Error fetching tasks', 'error')
      this.logger.error(error)
      return []
    }
  }

  async createTask(
    inputTask: string,
    selectedTaskList?: string
  ): Promise<boolean> {
    const newTask = await this.api.createTask(inputTask, selectedTaskList)
    if (newTask) {
      addNotification('Task created', 'success')
    }
    return !!newTask
  }

  async setTaskStatus(
    taskId: string,
    status: boolean,
    taskListId?: string
  ): Promise<boolean> {
    const taskStatus = status ? 'completed' : 'needsAction'
    const updatedTask = await this.api.setTaskStatus(
      taskId,
      taskStatus,
      taskListId
    )
    return !!updatedTask
  }

  async updateTask(task: Task, taskListId?: string): Promise<boolean> {
    const updatedTask = await this.api.updateTask(task, taskListId)
    this.logger.log('updatedTask', updatedTask)
    return !!updatedTask
  }
}
