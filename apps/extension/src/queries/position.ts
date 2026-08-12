import { appState } from '@/app-state.svelte'
import {
  type GeoPositionResponse,
  getCurrentPosition,
} from '@melledijkstra/api'
import { createQuery } from '@tanstack/svelte-query'

export function usePositionQuery() {
  return createQuery<GeoPositionResponse | null>(() => ({
    queryKey: ['position'],
    retry: 1,
    queryFn: async () => {
      const pos = await getCurrentPosition()
      console.log('retrieved position', pos)
      if (pos?.locationInfo) {
        appState.geolocation = pos.locationInfo
        return pos
      }
      if (pos?.lat && pos?.lon) {
        return pos
      }
      throw new Error('Failed to get position')
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  }))
}
