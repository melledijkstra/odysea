import { DAILY_IMAGE_KEY, NEXT_IMAGE_KEY } from '@/constants'
import { Logger } from '@/logger'
import type { ILogger } from '@/interfaces/logger.interface'
import { ExtensionStorage } from '@melledijkstra/extension'

export type ImageInfo = {
  id: string
  url: string
  date?: string
}

export class ImageCache implements ILogger {
  logger = new Logger('ImageCache')
  private cache = new ExtensionStorage()

  async getDailyImageInfo(): Promise<ImageInfo | undefined> {
    return this.cache.get<ImageInfo>(DAILY_IMAGE_KEY)
  }

  async setDailyImageInfo(info: ImageInfo): Promise<void> {
    await this.cache.set(DAILY_IMAGE_KEY, info)
    this.logger.log('stored daily image', info)
  }

  async getNextImageInfo(): Promise<ImageInfo | undefined> {
    return this.cache.get<ImageInfo>(NEXT_IMAGE_KEY)
  }

  async setNextImageInfo(info: ImageInfo): Promise<void> {
    await this.cache.set(NEXT_IMAGE_KEY, info)
    this.logger.log('stored next image', info)
  }

  async clearDailyImage(): Promise<void> {
    await this.cache.delete(DAILY_IMAGE_KEY)
    this.logger.log('Daily image cleared from storage')
  }

  async clearNextImage(): Promise<void> {
    await this.cache.delete(NEXT_IMAGE_KEY)
    this.logger.log('Next image cleared from storage')
  }

  async clearImageCache(): Promise<void> {
    await this.cache.delete(DAILY_IMAGE_KEY)
    await this.cache.delete(NEXT_IMAGE_KEY)
    this.logger.log('Daily and next images cleared from storage')
  }
}
