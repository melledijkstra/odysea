import type { TaskControllerInterface } from '@/controllers/TaskController.interface'
import type { Task, TaskList } from '@/interfaces/tasks'

export class MockTasksController implements TaskControllerInterface {
  canCreateTask = true
  defaultListId = '1'
  private tasks: Task[] = []
  private taskLists: TaskList[] = []

  constructor(initialData?: { tasks?: Task[]; taskLists?: TaskList[] }) {
    if (initialData?.tasks) this.tasks = initialData.tasks
    if (initialData?.taskLists) this.taskLists = initialData.taskLists
  }

  async authenticate(): Promise<boolean> {
    return true
  }

  async isAuthenticated(): Promise<boolean> {
    return true
  }

  async isEnabled(): Promise<boolean> {
    return true
  }

  async getTasks(): Promise<Task[]> {
    return this.tasks
  }

  async getTaskLists(): Promise<TaskList[]> {
    return this.taskLists
  }

  async createTask(taskTitle: string): Promise<boolean> {
    const id = (this.tasks.length + 1).toString()
    this.tasks.push({
      id,
      title: taskTitle,
      status: 'needsAction',
    })
    return true
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.find((task) => task.id === taskId)
  }

  async setTaskStatus(taskId: string, status: boolean): Promise<boolean> {
    const idx = this.tasks.findIndex((task) => task.id === taskId)
    const updatedTask: Task = {
      ...this.tasks[idx],
      status: status ? 'completed' : 'needsAction',
    }
    if (idx !== -1) {
      this.tasks[idx] = updatedTask
    }
    return true
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const idx = this.tasks.findIndex((task) => task.id === taskId)
    if (idx !== -1) {
      this.tasks.splice(idx, 1)
    }
    return true
  }

  async updateTask(editedTask: Task): Promise<boolean> {
    const idx = this.tasks.findIndex((task) => task.id === editedTask.id)
    if (idx !== -1) {
      this.tasks[idx] = editedTask
    }
    return true
  }
}
