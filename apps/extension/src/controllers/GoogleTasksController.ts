import type { Task, TaskList } from "@/api/definitions/google"
import { GoogleTasksApiClient } from "@/api/google/tasks"
import type { ILogger } from "@/interfaces/logger.interface"
import { Logger } from "@/logger"
import type { GoogleTasksState } from "@/modules/google-tasks/state.svelte"
import { AuthClient } from "@melledijkstra/extension"
import { GoogleAuthProvider } from "@/oauth2/providers"
import { addNotification } from "@/stores/notifications.svelte"

export type TaskControllerInterface = {
  getTasks: (taskListId?: string) => Promise<Task[]>
  getTaskLists: () => Promise<TaskList[]>
  createTask: (taskTitle: string, taskListId?: string) => Promise<boolean>
  setTaskStatus: (taskId: string, status: boolean, taskListId?: string) => Promise<boolean>
  deleteTask: (taskId: string, taskListId?: string) => Promise<boolean>
  updateTask: (task: Task, taskListId?: string) => Promise<boolean>
}

export class GoogleTasksController implements TaskControllerInterface, ILogger {
  logger: Logger
  public readonly auth: AuthClient
  private readonly api: GoogleTasksApiClient
  protected readonly state: GoogleTasksState
  
  constructor(state: GoogleTasksState) {
    this.logger = new Logger('GoogleTasksController')
    this.auth = new AuthClient(new GoogleAuthProvider())
    this.api = new GoogleTasksApiClient(this.auth)
    this.state = state
  }

  async deleteTask(taskId: string, taskListId?: string): Promise<boolean> {
    const success = await this.api.deleteTask(taskId, taskListId)
    if (success) {
      this.state.tasks = this.state.tasks.filter((task) => task.id !== taskId)
    }
    return success
  }
  
  async initialize() {
    await this.auth.getAuthToken(false)
  }
  
  async getTaskLists(): Promise<TaskList[]> {
    const taskLists = await this.api.getTaskLists()
    
    if (taskLists) {
      this.state.taskLists = taskLists
    }
    
    return this.state.taskLists
  }
  
  async getTasks(taskListId?: string): Promise<Task[]> {
    try {
      const tasks = await this.api.fetchTasks(taskListId, false)
      
      if (tasks) {
        this.state.tasks = tasks
      }
      
      return this.state.tasks
    } catch (error) {
      addNotification('Error fetching tasks', 'error')
      this.logger.error(error)
      return []
    }
  }

  async createTask(inputTask: string, selectedTaskList?: string): Promise<boolean> {
    const newTask = await this.api.createTask(inputTask, selectedTaskList)
    if (newTask) {
      this.state.tasks = [newTask, ...this.state.tasks]
      addNotification('Task created', 'success')
    }
    return !!newTask
  }

  async setTaskStatus(taskId: string, status: boolean, taskListId?: string): Promise<boolean> {
    const taskStatus = status ? 'completed' : 'needsAction'
    const updatedTask = await this.api.setTaskStatus(taskId, taskStatus, taskListId)
    if (updatedTask) {
      this.state.tasks = this.state.tasks.map((task) => task.id === taskId ? updatedTask : task)
    }
    return !!updatedTask
  }

  async updateTask(task: Task, taskListId?: string): Promise<boolean> {
    const updatedTask = await this.api.updateTask(task, taskListId)
    this.logger.log('updatedTask', updatedTask)
    if (updatedTask) {
      this.state.tasks = this.state.tasks.map((task) => task.id === updatedTask.id ? updatedTask : task)
    }
    return !!updatedTask
  }
}