export interface Identifiable {
  id: string
}

export interface IRepositoryAdapter<T extends Identifiable> {
  getAll(): Promise<T[]>
  add(item: Omit<T, 'id'>): Promise<T>
  update(item: T): Promise<void>
  delete(id: string): Promise<void>
}
