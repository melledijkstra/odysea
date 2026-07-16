// we don't want svelte reactivity for the createdAt and
// updatedAt fields because they are managed by the database and not the UI
/* eslint-disable svelte/prefer-svelte-reactivity */

export interface IExport<T> {
  readonly items: T[]
  initialize(): Promise<void>
  add(item: T): Promise<void>
  remove(id: string): Promise<void>
  update(item: T & { id: string }): Promise<void>
}

export type DBItem<T> = T & { id: string, createdAt: Date, updatedAt: Date }

export class DbStore<T> implements IExport<DBItem<T>> {
  private readonly fetchAll: () => Promise<T[]>
  private readonly addItem: (item: T) => Promise<void>
  private readonly updateItem: (item: T & { id: string }) => Promise<void>
  private readonly deleteItem: (id: string) => Promise<void>

  private _items = $state<DBItem<T>[]>([])

  get items() {
    return this._items
  }

  constructor(
    fetchAll: () => Promise<T[]>,
    addItem: (item: T) => Promise<void>,
    updateItem: (item: T & { id: string }) => Promise<void>,
    deleteItem: (id: string) => Promise<void>,
  ) {
    this.fetchAll = fetchAll
    this.addItem = addItem
    this.updateItem = updateItem
    this.deleteItem = deleteItem
  }

  async initialize() {
    const items = await this.fetchAll() as DBItem<T>[]
    this._items = items
  }

  async add(item: T) {
    await this.addItem({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const items = await this.fetchAll() as DBItem<T>[]
    this._items = items
  }

  async remove(id: string) {
    await this.deleteItem(id)
    const index = this._items.findIndex(item => item.id === id)
    if (index !== -1) {
      this._items.splice(index, 1)
    }
  }

  async update(updatedItem: T & { id: string }) {
    const updatedAt = new Date()
    await this.updateItem({
      ...updatedItem,
      updatedAt,
    })
    const index = this._items.findIndex(item => item.id === updatedItem.id)
    if (index !== -1) {
      this._items[index] = { ...this._items[index], ...updatedItem, updatedAt }
    }
  }
}
