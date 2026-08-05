import type { AuthClient } from '@melledijkstra/auth'
import type { TaskList, Task } from '../../definitions/google'
import { TokenBaseClient } from '../../tokenbaseclient'
import { Logger } from '@melledijkstra/toolbox'

const BASE_URL = 'https://tasks.googleapis.com/tasks/v1'

export class GoogleTasksApiClient extends TokenBaseClient {
  private logger = new Logger('GoogleTasksApiClient')
  public taskLists: TaskList[] = []
  public tasks: Task[] = []

  constructor(private readonly auth: AuthClient) {
    super(BASE_URL, () => this.auth.getAuthToken())
  }

  private async safeRequest<T>(
    endpoint: string,
    options?: RequestInit,
    queryParams?: URLSearchParams
  ): Promise<T | undefined> {
    try {
      const response = await this.request<T>(endpoint, options, queryParams)
      return response ?? undefined
    } catch (error) {
      this.logger.error(`Error requesting ${endpoint}`, error)
      return undefined
    }
  }

  async fetchTasks(
    taskListId: string = '@default',
    completed?: boolean
  ): Promise<Task[]> {
    const queryParams = new URLSearchParams()
    if (!completed) {
      queryParams.set('showCompleted', 'false')
    }
    const response = await this.safeRequest<{ items: Task[] }>(
      `/lists/${taskListId}/tasks`,
      {},
      queryParams
    )
    return response?.items ?? []
  }

  async getTaskLists(): Promise<TaskList[]> {
    const response = await this.safeRequest<{ items: TaskList[] }>(
      '/users/@me/lists'
    )
    return response?.items ?? []
  }

  async setTaskStatus(
    task: string | Task,
    status: Task['status'] = 'completed',
    taskListId: string = '@default'
  ): Promise<Task | undefined> {
    const id = typeof task === 'string' ? task : task.id
    const taskData: Partial<Task> = { status }
    return this.safeRequest<Task>(`/lists/${taskListId}/tasks/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
      body: JSON.stringify(taskData),
    })
  }

  async updateTask(
    task: Task,
    taskListId: string = '@default'
  ): Promise<Task | undefined> {
    return this.safeRequest<Task>(`/lists/${taskListId}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
  }

  async createTask(
    title: string,
    taskListId: string = '@default'
  ): Promise<Task | undefined> {
    const taskData = JSON.stringify({ title })
    return this.safeRequest<Task>(`/lists/${taskListId}/tasks`, {
      method: 'POST',
      body: taskData,
    })
  }

  async deleteTask(
    task: string | Task,
    taskListId: string = '@default'
  ): Promise<boolean> {
    const id = typeof task === 'string' ? task : task.id
    try {
      await this.request(`/lists/${taskListId}/tasks/${id}`, {
        method: 'DELETE',
      })
      return true
    } catch (error) {
      this.logger.error('Error deleting task', error)
      return false
    }
  }
}
