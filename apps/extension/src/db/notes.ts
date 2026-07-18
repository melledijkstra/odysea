import { storeInDB, getAllItems, updateInDB, deleteInDB } from '@/db'
import {
  type IRepositoryAdapter,
  type Insertable,
} from '@melledijkstra/storage'

export const DB_NAME = 'notes' as const

export type Note = {
  id: string
  title: string
  text: string
  createdAt: Date
  updatedAt: Date
}

class NotesRepository implements IRepositoryAdapter<Note> {
  async getAll(): Promise<Note[]> {
    return await getAllItems(DB_NAME)
  }

  async add(note: Insertable<Note>): Promise<Note> {
    const noteWithMeta = {
      ...note,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Note
    const id = await storeInDB(DB_NAME, noteWithMeta)
    noteWithMeta.id = id
    return noteWithMeta
  }

  async update(note: Note): Promise<void> {
    await updateInDB(DB_NAME, note)
  }

  async delete(id: string): Promise<void> {
    await deleteInDB(DB_NAME, id)
  }
}

export const notesRepository = new NotesRepository()
