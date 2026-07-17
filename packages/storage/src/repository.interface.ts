export interface Identifiable {
  id: string
}

export type Insertable<T extends Identifiable> =
  Omit<T, 'id' | 'createdAt' | 'updatedAt'> &
  Partial<
    Pick<T, Extract<'createdAt' | 'updatedAt', keyof T>>
  >

export interface IRepositoryAdapter<T extends Identifiable> {
  getAll(): Promise<T[]>
  add(item: Insertable<T>): Promise<T>
  update(item: T): Promise<void>
  delete(id: string): Promise<void>
}
