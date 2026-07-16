import { type Note } from '@/db/notes'
import type { DbStore } from '@/stores/databaseStore.svelte'

export class NotesController {
  constructor(protected store: DbStore<Note>) {}

  async addNote(note: Note) {
    await this.store.add(note)
  }
}
