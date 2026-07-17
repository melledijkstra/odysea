import { type Note } from '@/db/notes'
import type { DbStore } from '@/stores/databaseStore.svelte'
import type { Insertable } from '@melledijkstra/storage'

export class NotesController {
  constructor(protected store: DbStore<Note>) {}

  async addNote(note: Insertable<Note>) {
    await this.store.add(note)
  }
}
