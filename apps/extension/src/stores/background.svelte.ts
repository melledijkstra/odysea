import { Logger } from '@/logger'

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

export const background = $state<{ url: string | undefined }>({
  url: undefined,
})

export async function setBackgroundImage(url: string) {
  const src = await fetchImage(url)
  background.url = src
}
