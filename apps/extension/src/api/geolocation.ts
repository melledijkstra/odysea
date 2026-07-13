import { withCache } from '@/cache/memory'
import { Logger } from '@/logger'

const logger = new Logger('Geolocation')

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

const LOCATION_API_URL =
  'http://ip-api.com/json?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone'

async function fetchGeolocation(): Promise<LocationResponse | undefined> {
  const response = await fetch(LOCATION_API_URL)

  if (response.ok) {
    return (await response.json()) as LocationResponse
  }
}

const cachedFetchGeolocation = withCache(fetchGeolocation)

async function getGeolocationBrowser(): Promise<[number, number] | undefined> {
  return new Promise((resolve, reject) => {
    globalThis.navigator.geolocation.getCurrentPosition(
      (currentPosition) => {
        const { latitude, longitude } = currentPosition.coords
        resolve([latitude, longitude])
      },
      (error) => reject(new Error(error.message)),
      {
        timeout: 3000 // allow 3 seconds to return the position
      }
    )
  })
}

export type GeoPositionResponse = {
  lat: number
  lon: number
  locationInfo?: LocationInfo
}

/**
 * Retrieves the current geolocation of the user.
 * First attempts to get the position through the browser's geolocation API.
 * If that fails, it falls back to an external API service.
 * @returns the current position and optional location info, or undefined if it fails to retrieve the position
 */
export async function getCurrentPosition(): Promise<
  GeoPositionResponse | undefined
> {
  const browserPos = await getGeolocationBrowser().catch((_err) => undefined);
  if (browserPos) {
    return { lat: browserPos[0], lon: browserPos[1] }
  }

  logger.log('Failed to retrieve geolocation through browser, trying API service...')
  // if we can't get geolocation through browser we try through API service
  const data = await cachedFetchGeolocation()
  if (data?.status === 'success') {
    logger.log('retrieved location from API', [data.lat, data.lon])
    return { lat: data.lat, lon: data.lon, locationInfo: data }
  }
}
