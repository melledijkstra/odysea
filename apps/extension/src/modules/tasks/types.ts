export type TaskList = {
  id: string
  title: string
  updated?: string
}

export type Task = {
  id: string
  title: string
  status?: 'needsAction' | 'completed'
  webViewLink?: string
  updated?: string
}
