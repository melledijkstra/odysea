import type { Task, TaskList } from '@/modules/tasks/types'

export const mockTaskLists: TaskList[] = [
  {
    id: '1',
    title: 'Groceries',
    updated: '2024-06-07T07:15:00Z',
  },
  {
    id: '2',
    title: 'Work',
    updated: '2024-06-07T07:15:00Z',
  },
]

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Buy groceries',
    status: 'needsAction',
  },
  {
    id: '2',
    title: 'Finish project report',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Call plumber',
    status: 'needsAction',
  },
  {
    id: '4',
    title: 'Read a book',
    status: 'needsAction',
  },
  {
    id: '5',
    title: 'Workout',
    status: 'completed',
  },
]
