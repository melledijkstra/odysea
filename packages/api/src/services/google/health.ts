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

  /**
   * Retrieves total sleep minutes for today.
   */
  async getSleep(): Promise<number | undefined> {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    const startTime = yesterday.toISOString()

    // We need to URL encode the filter string
    const filter = `sleep.interval.end_time >= "${startTime}"`
    const urlParams = new URLSearchParams({
      filter: filter,
    })

    let response: ReconcileDataPointsResponse | undefined
    try {
      const res = await this.request<ReconcileDataPointsResponse>(
        `/users/me/dataTypes/sleep/dataPoints:reconcile`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        urlParams
      )
      response = res ?? undefined
    } catch (error) {
      this.logger.error(
        'Error requesting /users/me/dataTypes/sleep/dataPoints:reconcile',
        error
      )
      return undefined
    }

    this.logger.log('Sleep data response:', response)

    const points = response?.dataPoints || []

    if (points.length === 0) {
      this.logger.log('No sleep points returned from API or empty response')
      return undefined
    }

    // Find the latest point and extract the duration
    let totalMinutes = 0
    for (const point of points) {
      const duration = this.extractSleepDuration(point)
      totalMinutes = Math.max(totalMinutes, duration)
    }

    return totalMinutes
  }

  private extractSleepDuration(
    point: NonNullable<ReconcileDataPointsResponse['dataPoints']>[number]
  ): number {
    const durationStr = point.sleep?.summary?.minutesAsleep
    if (!durationStr) return 0

    const duration = parseInt(durationStr, 10)
    return isNaN(duration) ? 0 : duration
  }
}
