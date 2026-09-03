import { GoogleTasksApiClient } from '@melledijkstra/api'
import type { ILogger } from '@/interfaces/logger.interface'
import { Logger } from '@/logger'
import type { AuthClient } from '@melledijkstra/auth'
import { authState } from '@/oauth2/auth.state.svelte'
import { addNotification } from '@/stores/notifications.svelte'
import type { Task, TaskList } from '@/modules/tasks/types'
import { scopeRegistry, TASKS_SCOPE } from '@/oauth2/scope-registry'
import type { TaskControllerInterface } from './TaskController.interface'

export class GoogleTasksController implements TaskControllerInterface, ILogger {
  canCreateTask = true
  defaultListId = '@default'
  logger: Logger
  public readonly auth: AuthClient
  private readonly api: GoogleTasksApiClient

  constructor() {
    this.logger = new Logger('GoogleTasksController')
    this.auth = authState.clients.google
    this.api = new GoogleTasksApiClient(this.auth)
  }

  async deleteTask(taskId: string, taskListId?: string): Promise<boolean> {
    const success = await this.api.deleteTask(taskId, taskListId)
    return success
  }

  async authenticate(): Promise<boolean> {
    return !!(await this.auth.getAuthToken(true, [TASKS_SCOPE]))
  }

  async isAuthenticated(): Promise<boolean> {
    return await this.auth.isAuthenticated()
  }

  async initialize() {
    await this.isAuthenticated()
  }

  async isEnabled(): Promise<boolean> {
    const isAuthenticated = await this.isAuthenticated()
    const grantedScopes = await this.auth.getGrantedScopes()
    const allScopesGranted = scopeRegistry['tasks'].scopes.every((scope) =>
      grantedScopes.includes(scope)
    )
    return isAuthenticated && allScopesGranted
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
