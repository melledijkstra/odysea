import { dbPromise, storeInDB } from '@/db'
import { Logger } from '@/logger'

const logger = new Logger('FocusDB')

export type FocusSession = {
  id: number
  topic?: string
  startDateTime: Date
  endDateTime: Date
  // in minutes
  totalDuration: number
  habitId?: number
  taskId?: string
  tags?: string[]
}

export async function storeFocusSession(session: FocusSession) {
  logger.log('Storing focus session', session)
  await storeInDB('focus', session)
}

export async function getAllFocusSessions(): Promise<FocusSession[]> {
  const db = await dbPromise
  return await db.getAll('focus')
}
