import { describe, it, expect } from 'vitest'
import { UnsplashClient } from './unsplash'

describe('UnsplashClient', () => {
  it('should initialize with config', () => {
    const client = new UnsplashClient({
      host: 'http://localhost:3000',
      query: 'nature',
      collections: ['123', '456'],
    })
    expect(client.getConfig().host).toBe('http://localhost:3000')
    expect(client.getConfig().query).toBe('nature')
    expect(client.getConfig().collections).toEqual(['123', '456'])
  })

  describe('getQueryParameters', () => {
    it('should return empty URLSearchParams when query and collections are not provided', () => {
      const client = new UnsplashClient({ host: 'http://localhost' })
      const params = client.getQueryParameters()
      expect(params.toString()).toBe('')
    })

    it('should include query if provided', () => {
      const client = new UnsplashClient({
        host: 'http://localhost',
        query: 'nature',
      })
      const params = client.getQueryParameters()
      expect(params.get('query')).toBe('nature')
      expect(params.get('collections')).toBeNull()
    })

    it('should include collections joined by comma if provided', () => {
      const client = new UnsplashClient({
        host: 'http://localhost',
        collections: ['col1', 'col2', 'col3'],
      })
      const params = client.getQueryParameters()
      expect(params.get('query')).toBeNull()
      expect(params.get('collections')).toBe('col1,col2,col3')
    })

    it('should include both query and collections', () => {
      const client = new UnsplashClient({
        host: 'http://localhost',
        query: 'space',
        collections: ['999'],
      })
      const params = client.getQueryParameters()
      expect(params.get('query')).toBe('space')
      expect(params.get('collections')).toBe('999')
    })
  })
})
