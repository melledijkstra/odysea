import type { TaskControllerInterface } from '@/controllers/GoogleTasksController'
import { createQuery } from '@tanstack/svelte-query'

export interface TaskListQueryParams {
  providerId: string
  controller: TaskControllerInterface
}

export function useTasksListQuery(getParams: () => TaskListQueryParams) {
  return createQuery(() => {
    const { providerId, controller } = getParams()
    return {
      queryKey: ['tasks', providerId, 'lists'],
      queryFn: async () => await controller.getTaskLists(),
      enabled: !!providerId,
      staleTime: 5 * 60 * 1000,
    }
  })
}

export interface TasksQueryParams extends TaskListQueryParams {
  taskListId: string
  enabled?: boolean
}

export function useTasksQuery(getParams: () => TasksQueryParams) {
  return createQuery(() => {
    const { providerId, controller, taskListId, enabled = true } = getParams()
    return {
      queryKey: ['tasks', providerId, 'tasks', taskListId],
      queryFn: async () => await controller.getTasks(taskListId),
      enabled: !!taskListId && enabled,
      staleTime: 5 * 60 * 1000,
    }
  })
}
