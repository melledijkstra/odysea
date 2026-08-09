import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase, StoreNames, StoreValue } from 'idb'
import type { Habit } from './habits'
import type { Note } from './notes'
import type { FocusSession } from './focus'
import { Logger } from '@/logger'

export const logger = new Logger('db')

export interface OdyseaExtensionDB extends DBSchema {
  habits: {
    key: number
    value: Habit
    indexes: { id: number }
  }
  notes: {
    key: number
    value: Note
    indexes: { id: number }
  }
  focus: {
    key: number
    value: FocusSession
    indexes: { id: number }
  }
}

type StoreName = StoreNames<OdyseaExtensionDB>

async function createSimpleDB(
  db: IDBPDatabase<OdyseaExtensionDB>,
  dbName: StoreName
) {
  if (!db.objectStoreNames.contains(dbName)) {
    const store = db.createObjectStore(dbName, {
      keyPath: 'id',
      autoIncrement: true,
    })
    store.createIndex('id', 'id')
  }
}

export const dbPromise = openDB<OdyseaExtensionDB>('OdyseaExtensionDB', 7, {
  upgrade: async (db) => {
    await createSimpleDB(db, 'habits')
    await createSimpleDB(db, 'notes')
    await createSimpleDB(db, 'focus')
  },
})

export async function getAllItems<DBName extends StoreNames<OdyseaExtensionDB>>(
  dbName: DBName
): Promise<StoreValue<OdyseaExtensionDB, DBName>[]> {
  const db = await dbPromise
  return await db.getAll(dbName)
}

export async function storeInDB<DBName extends StoreNames<OdyseaExtensionDB>>(
  dbName: DBName,
  value: StoreValue<OdyseaExtensionDB, DBName>
): Promise<number> {
  const db = await dbPromise
  const key = await db.add(dbName, value)
  return key
}

export async function updateInDB<DBName extends StoreNames<OdyseaExtensionDB>>(
  dbName: DBName,
  value: StoreValue<OdyseaExtensionDB, DBName>,
  key?: number
) {
  const db = await dbPromise
  await db.put(dbName, value, key)
}

export async function deleteInDB<DBName extends StoreNames<OdyseaExtensionDB>>(
  dbName: DBName,
  id: number
) {
  const db = await dbPromise
  await db.delete(dbName, id)
}

export async function clearDB<DBName extends StoreNames<OdyseaExtensionDB>>(
  dbName: DBName
) {
  const db = await dbPromise
  await db.clear(dbName)
}
