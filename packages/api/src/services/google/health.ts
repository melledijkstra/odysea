import type { AuthClient } from '@melledijkstra/auth'
import { TokenBaseClient } from '../../tokenbaseclient'
import { Logger } from '@melledijkstra/toolbox'
import type { SleepRollUpResponse } from '../../definitions/google'

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

    const requestBody = {
      range: {
        start: {
          date: {
            year: yesterday.getFullYear(),
            month: yesterday.getMonth() + 1,
            day: yesterday.getDate(),
          },
          time: { hours: 0, minutes: 0, seconds: 0 },
        },
        end: {
          date: {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
          },
          time: { hours: 0, minutes: 0, seconds: 0 },
        },
      },
      windowSizeDays: 1,
    }

    const response = await this.safeRequest<SleepRollUpResponse>(
      '/users/me/dataTypes/sleep/dataPoints:dailyRollUp',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response || !response.points || response.points.length === 0) {
      this.logger.log(
        'No sleep points returned from API or empty response',
        response
      )
      return 0
    }

    this.logger.log('Sleep data response:', response)

    // Find the latest point and extract the duration
    // The structure depends on Google's final sleep schema,
    // usually it contains a sleep summary with total duration.
    // For now we will safely navigate through the expected structure.
    let totalMinutes = 0
    for (const point of response.points) {
      if (point.value?.sleep?.summary?.totalDurationMinutes) {
        totalMinutes = Math.max(
          totalMinutes,
          point.value.sleep.summary.totalDurationMinutes
        )
      } else if (point.value?.durationMinutes) {
        totalMinutes = Math.max(totalMinutes, point.value.durationMinutes)
      }
    }

    return totalMinutes
  }
}
