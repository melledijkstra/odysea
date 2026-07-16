import type { Task, TaskList } from '@/api/definitions/google'

export type GoogleTasksState = {
  taskLists: TaskList[]
  tasks: Task[]
}

export const state = $state<GoogleTasksState>({
  taskLists: [],
  tasks: [],
})
