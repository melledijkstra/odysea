import type { Task, TaskList } from '@/api/definitions/google'

export const mockTaskLists: TaskList[] = [
  {
    id: '1',
    title: 'Groceries',
    kind: 'tasks#taskList',
    etag: '1',
    updated: '2024-06-07T07:15:00Z',
    selfLink: 'https://www.googleapis.com/tasks/v1/users/@me/lists/1',
  },
  {
    id: '2',
    title: 'Work',
    kind: 'tasks#taskList',
    etag: '1',
    updated: '2024-06-07T07:15:00Z',
    selfLink: 'https://www.googleapis.com/tasks/v1/users/@me/lists/2',
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
