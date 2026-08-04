import type { AuthClient } from '@melledijkstra/auth'
import { TokenBaseClient } from '../../tokenbaseclient'
import { Logger } from '@melledijkstra/toolbox'

import type { ReconcileDataPointsResponse } from '../../definitions/google'

const BASE_URL = 'https://health.googleapis.com/v4'

export class GoogleHealthApiClient extends TokenBaseClient {
  private logger = new Logger('GoogleHealthApiClient')

  constructor(private readonly auth: AuthClient) {
    super(BASE_URL, () => this.auth.getAuthToken())
  }

  private async safeRequest<T>(
    endpoint: string,
    options?: RequestInit,
    queryParams?: URLSearchParams
  ): Promise<T | undefined> {
    try {
      const response = await this.request<T>(endpoint, options, queryParams)
      return response ?? undefined
    } catch (error) {
      this.logger.error(`Error requesting ${endpoint}`, error)
      return undefined
    }
  }

  /**
   * Retrieves total sleep minutes for today.
   */
  async getSleep(): Promise<number> {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    const startTime = yesterday.toISOString()

    // We need to URL encode the filter string
    const filter = `sleep.interval.end_time >= "${startTime}"`
    const urlParams = new URLSearchParams({
      filter: filter,
    })

    const response = await this.safeRequest<ReconcileDataPointsResponse>(
      `/users/me/dataTypes/sleep/dataPoints:reconcile`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
      urlParams
    )

    this.logger.log('Sleep data response:', response)

    const points = response?.dataPoints || []

    if (points.length === 0) {
      this.logger.log('No sleep points returned from API or empty response')
      return 0
    }

    // Find the latest point and extract the duration
    let totalMinutes = 0
    for (const point of points) {
      const durationStr = point.sleep?.summary?.minutesAsleep
      if (durationStr) {
        const duration = parseInt(durationStr, 10)
        if (!isNaN(duration)) {
          totalMinutes = Math.max(totalMinutes, duration)
        }
      }
    }

    return totalMinutes
  }
}
