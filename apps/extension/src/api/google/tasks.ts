import type { TaskList, Task } from '@/api/definitions/google'
import { TokenBaseClient } from '../tokenbaseclient'
import type { AuthClient } from '@melledijkstra/extension'

const BASE_URL = 'https://tasks.googleapis.com/tasks/v1'

export class GoogleTasksApiClient extends TokenBaseClient {
  private readonly auth: AuthClient
  public taskLists: TaskList[] = []
  public tasks: Task[] = []

  constructor(auth: AuthClient) {
    super(BASE_URL, '')
    this.auth = auth
  }

  async request<T>(endpoint: string, config?: RequestInit, queryParams?: URLSearchParams): Promise<T | undefined> {
    const token = await this.auth.getAuthToken()
    this.token = token ?? ''

    return super.request<T>(endpoint, config, queryParams)
  }

  async fetchTasks(taskListId: string = '@default', completed?: boolean): Promise<Task[]> {
    try {
      const queryParams = new URLSearchParams()

      if (!completed) {
        queryParams.set('showCompleted', 'false')
      }

      const response = await this.request<{ items: Task[] }>(
        `/lists/${taskListId}/tasks`,
        {},
        queryParams
      )

      return response?.items ?? []
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
  }

  async getTaskLists(): Promise<TaskList[] | undefined> {
    try {
      const response = await this.request<{ items: TaskList[] }>(
        '/users/@me/lists'
      )

      return response?.items ?? []
    } catch (error) {
      console.error('Error fetching task lists:', error)
    }
  }

  async setTaskStatus(
    task: string | Task,
    status: Task['status'] = 'completed',
    taskListId: string = '@default'
  ): Promise<Task | undefined> {
    const id = typeof task === 'string' ? task : task.id
    const taskData: Partial<Task> = {
      status
    }
    try {
      const response = await this.request<Task>(
        `/lists/${taskListId}/tasks/${id}`,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'PATCH',
          body: JSON.stringify(taskData)
        }
      )

      if (response) {
        return response
      }
    } catch (error) {
      console.error('Error completing task', error)
    }
  }

  async updateTask(task: Task, taskListId: string = '@default'): Promise<Task | undefined> {
    try {
      const response = await this.request<Task>(
        `/lists/${taskListId}/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(task)
        }
      )

      if (response) {
        return response
      }
    } catch (error) {
      console.error('Error updating task', error)
    }
  }

  async createTask(
    title: string,
    taskListId: string = '@default'
  ): Promise<Task | undefined> {
    const taskData = JSON.stringify({ title })
    try {
      const response = await this.request<Task>(
        `/lists/${taskListId}/tasks`,
        {
          method: 'POST',
          body: taskData
        }
      )

      if (response) {
        return response
      }
    } catch (error) {
      console.error('Error creating a task', error)
    }
  }

  async deleteTask(
    task: string | Task,
    taskListId: string = '@default'
  ): Promise<boolean> {
    const id = typeof task === 'string' ? task : task.id
    try {
      await this.request(
        `/lists/${taskListId}/tasks/${id}`,
        { method: 'DELETE' }
      )
      return true
    } catch (error) {
      console.error('Error deleting task', error)
    }
    return false
  }
}
