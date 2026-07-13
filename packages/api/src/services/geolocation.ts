import { withCache } from '@melledijkstra/storage'
import { Logger } from '@melledijkstra/toolbox'

const logger = new Logger('GeolocationApi')

type LocationResponse = {
  status: 'success' | 'fail'
  message?: 'private range' | 'reserved range' | 'invalid query'
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  lat: number
  lon: number
  timezone: string
}

export type LocationInfo = Omit<LocationResponse, 'status' | 'message'>

const LOCATION_API_URL
  = 'https://ipapi.co/json/'

async function fetchGeolocation(): Promise<LocationResponse | undefined> {
  const response = await fetch(LOCATION_API_URL)

  if (response.ok) {
    const data = await response.json()
    // Map ipapi.co response to the original LocationResponse shape
    return {
      status: 'success',
      country: data.country_name,
      countryCode: data.country_code,
      region: data.region_code,
      regionName: data.region,
      city: data.city,
      lat: data.latitude,
      lon: data.longitude,
      timezone: data.timezone,
    } as LocationResponse
  }
}

const cachedFetchGeolocation = withCache(fetchGeolocation)

async function getGeolocationBrowser(): Promise<[number, number] | undefined> {
  return new Promise((resolve, reject) => {
    window.navigator.geolocation.getCurrentPosition(
      (currentPosition) => {
        const { latitude, longitude } = currentPosition.coords
        resolve([latitude, longitude])
      },
      error => reject(error),
      {
        timeout: 3000, // allow 3 seconds to return the position
      },
    )
  })
}

/**
 * Retrieves the current geolocation of the user.
 * First attempts to get the position through the browser's geolocation API.
 * If that fails, it falls back to an external API service.
 * @returns the current position as [latitude, longitude] or undefined if it fails to retrieve the position
 */
export async function getCurrentPosition(): Promise<
  [number, number] | undefined
> {
  try {
    return await getGeolocationBrowser()
  }
  catch {
    logger.log('Failed to retrieve geolocation through browser, trying API service...')
    // if we can't get geolocation through browser we try through API service
    const data = await cachedFetchGeolocation()
    if (data?.status === 'success') {
      logger.log('retrieved location from API', [data.lat, data.lon])
      return [data.lat, data.lon]
    }
  }
}
