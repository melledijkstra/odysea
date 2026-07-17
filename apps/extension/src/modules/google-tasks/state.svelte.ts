import type { Task, TaskList } from '@melledijkstra/api'

export type GoogleTasksState = {
  taskLists: TaskList[]
  tasks: Task[]
}

export const state = $state<GoogleTasksState>({
  taskLists: [],
  tasks: [],
})
