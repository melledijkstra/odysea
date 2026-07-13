import { AuthClient } from '@melledijkstra/extension'
import { GoogleAuthProvider } from '@/oauth2/providers'
import { Logger } from '@melledijkstra/toolbox'

const logger = new Logger('Google Photos API')

export async function fetchPhotos() {
  const client = new AuthClient(new GoogleAuthProvider())
  const token = await client.getAuthToken()

  if (!token) {
    return
  }

  try {
    const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token?.toString()}`
      }
    })
  
    const data = await response.json()
    logger.log('Photos:', data.mediaItems)
  } catch (error) {
    logger.error('Error fetching photos:', error)
  }
}
