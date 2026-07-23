import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.resolve('state.db')
const db = new Database(dbPath)

// Enable WAL mode for performance
db.pragma('journal_mode = WAL')

// Initialize the database table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    last_executed_timestamp INTEGER,
    status TEXT
  )
`)

export interface Task {
  id: string
  name: string
  last_executed_timestamp: number | null
  status: string | null
}

/**
 * Retrieves the full task information by ID.
 * @param id The task identifier.
 * @returns The Task object, or null if not found.
 */
export function getTask(id: string): Task | null {
  const stmt = db.prepare(
    'SELECT id, name, last_executed_timestamp, status FROM tasks WHERE id = ?'
  )
  return (stmt.get(id) as Task) || null
}

/**
 * Retrieves the last execution timestamp for a given task ID.
 * @param id The task identifier.
 * @returns The timestamp (milliseconds or seconds) or null if the task doesn't exist or hasn't run.
 */
export function getLastExecutedTimestamp(id: string): number | null {
  const stmt = db.prepare(
    'SELECT last_executed_timestamp FROM tasks WHERE id = ?'
  )
  const result = stmt.get(id) as
    { last_executed_timestamp: number | null } | undefined
  return result ? result.last_executed_timestamp : null
}

/**
 * Updates the last execution timestamp (and optionally name and status) for a given task ID.
 * If the task does not exist, it inserts a new task.
 * @param id The task identifier.
 * @param timestamp The new execution timestamp (Unix epoch milliseconds or seconds).
 * @param status Optional new status for the task.
 * @param name Optional name of the task (used if inserting a new task).
 */
export function updateLastExecutedTimestamp(
  id: string,
  timestamp: number,
  status: string = 'RUNNING',
  name?: string
): void {
  const stmt = db.prepare(`
    INSERT INTO tasks (id, name, last_executed_timestamp, status)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      last_executed_timestamp = excluded.last_executed_timestamp,
      status = excluded.status
  `)

  const taskName = name || `Task ${id}`
  stmt.run(id, taskName, timestamp, status)
}
