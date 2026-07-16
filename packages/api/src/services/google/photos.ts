import { TokenBaseClient } from '../../tokenbaseclient'
import type { AuthClient } from '@melledijkstra/auth'

enum VideoProcessingStatus {
  "UNSPECIFIED" = "UNSPECIFIED", // Video processing status is unknown.
  "PROCESSING" = "PROCESSING", // Video is being processed. The user sees an icon for this video in the Google Photos app; however, it isn't playable yet.
  "READY" = "READY", // Video processing is complete and it is now ready for viewing. Important: attempting to download a video not in the READY state may fail.
  "FAILED" = "FAILED" // Something has gone wrong and the video has failed to process.
}

type Video = {
  "cameraMake": string,
  "cameraModel": string,
  "fps": number,
  "status": VideoProcessingStatus
}

type Photo = {
  "cameraMake": string,
  "cameraModel": string,
  "focalLength": number,
  "apertureFNumber": number,
  "isoEquivalent": number,
  "exposureTime": string
}

type MediaMetadata = {
  "creationTime": string,
  "width": string,
  "height": string,

  // Union field metadata can be only one of the following:
  "photo"?: Photo,
  "video"?: Video
  // End of list of possible types for union field metadata.
}

type ContributorInfo = {
  "profilePictureBaseUrl": string,
  "displayName": string
}

type MediaItem = {
  "id": string,
  "description": string,
  "productUrl": string,
  "baseUrl": string,
  "mimeType": string,
  "mediaMetadata": MediaMetadata,
  "contributorInfo": ContributorInfo,
  "filename": string
}

export class GooglePhotosApiClient extends TokenBaseClient {
  constructor(auth: AuthClient) {
    super('https://photoslibrary.googleapis.com', () => auth.getAuthToken())
  }

  async fetchPhotos(): Promise<Array<MediaItem> | undefined> {
    return this.request('/v1/mediaItems')
  }
}
