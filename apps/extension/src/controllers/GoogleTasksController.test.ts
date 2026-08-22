import { describe, it, expect, vi } from 'vitest'
import { GoogleTasksController } from './GoogleTasksController'

vi.mock('@melledijkstra/extension')

const mockGetTaskLists = vi.fn()

vi.mock('@melledijkstra/api', () => {
  return {
    GoogleTasksApiClient: class {
      getTaskLists = mockGetTaskLists
      fetchTasks = vi.fn().mockResolvedValue([])
    },
  }
})

describe('GoogleTasksController', () => {
  describe('Capabilities', () => {
    it('should declare correct capabilities', () => {
      const controller = new GoogleTasksController()
      expect(controller.canCreateTask).toBe(true)
      expect(controller.defaultListId).toBe('@default')
    })
  })

  describe('getTaskLists', () => {
    it('should return task lists fetched from API', async () => {
      mockGetTaskLists.mockResolvedValueOnce([
        { id: 'real-google-id-1', title: 'My Tasks' },
        { id: 'real-google-id-2', title: 'Work Tasks' },
      ])

      const controller = new GoogleTasksController()
      const taskLists = await controller.getTaskLists()

      expect(taskLists).toHaveLength(2)
      expect(taskLists[0]).toEqual({
        id: 'real-google-id-1',
        title: 'My Tasks',
      })
      expect(taskLists[1]).toEqual({
        id: 'real-google-id-2',
        title: 'Work Tasks',
      })
    })

    it('should handle empty task lists gracefully', async () => {
      mockGetTaskLists.mockResolvedValueOnce([])

      const controller = new GoogleTasksController()
      const taskLists = await controller.getTaskLists()
      expect(taskLists).toEqual([])
    })
  })
})
