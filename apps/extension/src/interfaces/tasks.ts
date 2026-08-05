export interface TaskList {
  id: string
  title: string
  updated?: string
}

export interface Task {
  id: string
  title: string
  status?: 'needsAction' | 'completed'
  webViewLink?: string
  updated?: string
}
