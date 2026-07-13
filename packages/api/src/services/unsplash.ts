import { Logger, ILogger } from '@melledijkstra/toolbox'
import type { UnsplashResponse } from '../definitions/unsplash'

const ENDPOINT = '/api/daily-image'

export class UnsplashClient implements ILogger {
  public logger: Logger = new Logger('UnsplashClient')
  private HOST: string
  public query?: string

  constructor(host: string, query?: string) {
    this.HOST = host
    this.logger.log('UnsplashClient initialized with host:', this.HOST)
    this.query = query
  }

  get host(): string {
    return this.HOST
  }

  setHost(host: string) {
    if (!host || host.trim() === '') {
      throw new Error('Serverless host domain cannot be empty')
    }
    this.logger.log('Setting new host for UnsplashClient:', host)
    this.HOST = host
  }

  async fetchUnsplashImage(): Promise<UnsplashResponse> {
    this.logger.log('Fetching Unsplash image from', {
      host: this.HOST,
      endpoint: ENDPOINT,
      query: this.query,
    })
    const serverUrl = new URL(ENDPOINT, this.HOST)

    if (this.query) {
      serverUrl.searchParams.set('query', this.query)
    }

    const response = await fetch(serverUrl)

    return (await response.json()) as UnsplashResponse
  }
}
