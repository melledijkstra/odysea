import type { GoogleTasksState } from '@/modules/google-tasks/state.svelte'
import type { TaskControllerInterface } from '../controllers/GoogleTasksController'
import type { Task, TaskList } from '@/api/definitions/google'

export class MockTasksController implements TaskControllerInterface {
  constructor(private readonly state: GoogleTasksState) {}

  async getTasks(taskListId?: string): Promise<Task[]> {
    return this.state.tasks
  }

  async getTaskLists(): Promise<TaskList[]> {
    return this.state.taskLists
  }

  async createTask(taskTitle: string, taskListId?: string): Promise<boolean> {
    const id = (this.state.tasks.length + 1).toString()
    this.state.tasks.push({
      id,
      title: taskTitle,
      status: 'needsAction',
    })
    return true
  }

  getTask(taskId: string): Task | undefined {
    return this.state.tasks.find(task => task.id === taskId)
  }

  async setTaskStatus(taskId: string, status: boolean, taskListId?: string): Promise<boolean> {
    const idx = this.state.tasks.findIndex(task => task.id === taskId)
    const updatedTask: Task = {
      ...this.state.tasks[idx],
      status: status ? 'completed' : 'needsAction',
    }
    if (idx !== -1) {
      this.state.tasks[idx] = updatedTask
    }
    return true
  }

  async deleteTask(taskId: string, taskListId?: string): Promise<boolean> {
    const idx = this.state.tasks.findIndex(task => task.id === taskId)
    if (idx !== -1) {
      this.state.tasks.splice(idx, 1)
    }
    return true
  }

  async updateTask(editedTask: Task): Promise<boolean> {
    const idx = this.state.tasks.findIndex(task => task.id === editedTask.id)
    if (idx !== -1) {
      this.state.tasks[idx] = editedTask
    }
    return true
  }
}
