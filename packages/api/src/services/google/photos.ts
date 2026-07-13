import { Logger } from '@melledijkstra/toolbox'
import { AuthClient } from '@melledijkstra/auth'
import { GoogleAuthProvider } from '@melledijkstra/auth'

const logger = new Logger('GooglePhotos')

export async function fetchPhotos() {
  const client = new AuthClient(new GoogleAuthProvider())
  const token = client.getAuthToken()

  fetch('https://photoslibrary.googleapis.com/v1/mediaItems', {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then(response => response.json())
    .then((data) => {
      logger.log('Photos:', data.mediaItems)
    })
    .catch(error => console.error('Error fetching photos:', error))
}
