import { Logger } from '@/logger'
import type { ImageInfo } from '../cache/image-cache'

const logger = new Logger('background-store')

function fetchImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image.src)
    image.onerror = (err) => {
      logger.error('Failed to load image', err)
      reject(new Error(`Failed to load image from source: ${src}`))
    }
    image.src = src
  })
}

export const background = $state<{
  url: string | undefined
  error: boolean
  info: ImageInfo | undefined
}>({
  url: undefined,
  error: false,
  info: undefined,
})

export async function setBackgroundImage(url: string, info?: ImageInfo) {
  try {
    const src = await fetchImage(url)
    background.url = src
    background.info = info
    background.error = false
  } catch {
    background.url = undefined
    background.info = undefined
    background.error = true
  }
}
