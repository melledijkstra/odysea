export type TaskList = {
  kind: string // Output only. Type of the resource. This is always "tasks#taskList".
  id: string // Task list identifier.
  etag?: string // ETag of the resource.
  title: string // Title of the task list. Maximum length allowed: 1024 characters.
  updated: string // Output only. Last modification time of the task list (as a RFC 3339 timestamp).
  selfLink?: string // Output only. URL pointing to this task list. Used to retrieve, update, or delete this task list.
}

export type Task = {
  id: string
  title: string
  kind?: string
  links?: string[]
  position?: string
  selfLink?: string
  status?: 'needsAction' | 'completed'
  updated?: string
  webViewLink?: string
}
