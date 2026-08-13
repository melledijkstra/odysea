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

export const background = $state<{
  url: string | undefined
  error: boolean
}>({
  url: undefined,
  error: false,
})

export async function setBackgroundImage(url: string) {
  try {
    const src = await fetchImage(url)
    background.url = src
    background.error = false
  } catch {
    background.url = undefined
    background.error = true
  }
}
