import { UnsplashClient as BaseUnsplashClient, type UnsplashResponse } from '@melledijkstra/api'
import { SERVERLESS_HOST_URL } from '@/constants'
import browser from 'webextension-polyfill'
import { addDays, formatDate } from '@/date'
import { ImageCache, type ImageInfo } from '../cache/image-cache'

const ENDPOINT = '/api/daily-image'

export class UnsplashClient extends BaseUnsplashClient {
  private readonly cache: ImageCache

  constructor(host: string = SERVERLESS_HOST_URL, query?: string) {
    super(host || SERVERLESS_HOST_URL, query)
    this.cache = new ImageCache()
  }

  // Override fetchUnsplashImage to append the Chrome Extension X-Extension-ID header
  async fetchUnsplashImage(): Promise<UnsplashResponse> {
    this.logger.log('Fetching Unsplash image from', {
      host: this.host,
      endpoint: ENDPOINT,
      query: this.query,
    })
    const serverlessUrl = new URL(ENDPOINT, this.host)

    if (this.query) {
      serverlessUrl.searchParams.set('query', this.query)
    }

    const response = await fetch(serverlessUrl, {
      headers: {
        'X-Extension-ID': browser.runtime.id,
      },
    })

    return (await response.json()) as UnsplashResponse
  }

  async retrieveNextImage(): Promise<ImageInfo> {
    const response = await this.fetchUnsplashImage()
    const tomorrow = addDays(new Date(), 1)
    const next: ImageInfo = {
      id: response.id,
      url: response.urls.full,
      date: formatDate(tomorrow),
    }

    await this.cache.setNextImageInfo(next)

    // Pre-cache the next image
    try {
      const imageCache = await caches.open('image-cache')
      const fetchResponse = await fetch(next.url)
      if (fetchResponse.ok) {
        await imageCache.put(next.url, fetchResponse)
      }
    }
    catch (e) {
      this.logger.error('Failed to pre-cache next image:', e)
    }

    return next
  }

  private async getImageUrlFromCacheOrFetch(url: string): Promise<string> {
    try {
      const imageCache = await caches.open('image-cache')
      const match = await imageCache.match(url)
      if (match) {
        this.logger.log('Serving image from Cache API:', url)
        const blob = await match.blob()
        return URL.createObjectURL(blob)
      }

      this.logger.log('Image not in Cache API, fetching:', url)
      const response = await fetch(url)
      if (response.ok) {
        const cacheResponse = response.clone()
        await imageCache.put(url, cacheResponse)
        const blob = await response.blob()
        return URL.createObjectURL(blob)
      }
    }
    catch (error) {
      this.logger.error('Failed to get image from cache or fetch:', error)
    }
    return url
  }

  async getDailyImage(): Promise<string | undefined> {
    const today = formatDate(new Date())
    const cached = await this.cache.getDailyImageInfo()

    let imageUrl = undefined

    if (cached?.date === today) {
      this.logger.log('retrieved daily image from cache')
      imageUrl = cached.url
    }
    else {
      const next = await this.cache.getNextImageInfo()
      let dailyImageInfo: ImageInfo

      if (next) {
        this.logger.log('next image exists, use that one instead')
        dailyImageInfo = { ...next, date: today }
        await this.cache.clearNextImage()
      }
      else {
        this.logger.log('no cached image found, fetching new one')
        const data = await this.fetchUnsplashImage()
        dailyImageInfo = { id: data.id, url: data.urls.full, date: today }
      }

      await this.cache.setDailyImageInfo(dailyImageInfo)
      this.retrieveNextImage()
      imageUrl = dailyImageInfo.url
    }

    if (imageUrl) {
      return this.getImageUrlFromCacheOrFetch(imageUrl)
    }
    return undefined
  }

  async refreshDailyImage(): Promise<string | undefined> {
    await this.cache.clearDailyImage()
    return this.getDailyImage()
  }

  clearNextImage() {
    return this.cache.clearNextImage()
  }

  clearImageCache() {
    return this.cache.clearImageCache()
  }
}
