import { type IRepositoryAdapter, type Identifiable } from '@melledijkstra/storage'

export class DbStore<T extends Identifiable> {
  private readonly adapter: IRepositoryAdapter<T>

  private _items = $state<T[]>([])

  get items() {
    return this._items
  }

  constructor(adapter: IRepositoryAdapter<T>) {
    this.adapter = adapter
  }

  async initialize() {
    this._items = await this.adapter.getAll()
  }

  async add(item: Omit<T, 'id'>) {
    const createdItem = await this.adapter.add(item)
    this._items.push(createdItem)
  }

  async remove(id: string) {
    await this.adapter.delete(id)
    const index = this._items.findIndex(item => item.id === id)
    if (index !== -1) {
      this._items.splice(index, 1)
    }
  }

  async update(updatedItem: T) {
    await this.adapter.update(updatedItem)
    const index = this._items.findIndex(item => item.id === updatedItem.id)
    if (index !== -1) {
      this._items[index] = updatedItem
    }
  }
}
