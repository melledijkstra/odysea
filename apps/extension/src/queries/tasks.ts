import type { TaskControllerInterface } from '@/controllers/GoogleTasksController'
import { createQuery } from '@tanstack/svelte-query'

export function useTasksListQuery(
  providerId: string,
  controller: TaskControllerInterface
) {
  return createQuery(() => ({
    queryKey: ['tasks', providerId, 'lists'],
    queryFn: async () => await controller.getTaskLists(),
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000,
  }))
}

export function useTasksQuery(
  providerId: string,
  controller: TaskControllerInterface,
  taskListId: string,
  enabled: boolean = true
) {
  return createQuery(() => ({
    queryKey: ['tasks', providerId, 'tasks', taskListId],
    queryFn: async () => await controller.getTasks(taskListId),
    enabled: !!taskListId && enabled,
    staleTime: 5 * 60 * 1000,
  }))
}
