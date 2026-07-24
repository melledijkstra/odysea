export interface TaskExecutionContext {
  /** Human-readable reason for this execution (e.g. "Cron Scheduled Run", "Webhook Trigger") */
  reason: string
  /** Port the server is running on, useful for logging auth URLs */
  port: number | string
}

export interface TaskResult {
  status: 'SUCCESS' | 'FAILED'
  details: string
}
