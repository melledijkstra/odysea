import { notesRepository, type Note } from '@/db/notes'
import { DbStore } from './databaseStore.svelte'

export const notes = new DbStore<Note>(notesRepository)
