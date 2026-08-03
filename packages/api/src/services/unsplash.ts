import { Logger } from '@melledijkstra/toolbox'
import type { UnsplashResponse } from '../definitions/unsplash'

const ENDPOINT = '/api/daily-image'

export class UnsplashClient {
  public logger: Logger = new Logger('UnsplashClient')
  private HOST: string
  public query?: string
  public collections?: string[]

  constructor(host: string, query?: string, collections?: string[]) {
    this.HOST = host
    this.logger.log('UnsplashClient initialized with host:', this.HOST)
    this.query = query
    this.collections = collections
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

  getQueryParameters(): URLSearchParams {
    const params = new URLSearchParams()
    if (this.query) {
      params.set('query', this.query)
    }
    if (this.collections && this.collections.length > 0) {
      params.set('collections', this.collections.join(','))
    }
    return params
  }

  getHeaders(): Headers {
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    return headers
  }

  async fetchUnsplashImage(): Promise<UnsplashResponse> {
    this.logger.log('Fetching Unsplash image from', {
      host: this.HOST,
      endpoint: ENDPOINT,
      query: this.query,
    })
    const serverUrl = new URL(ENDPOINT, this.HOST)

    const queryParams = this.getQueryParameters()
    serverUrl.search = queryParams.toString()

    const headers = this.getHeaders()

    const response = await fetch(serverUrl, {
      headers: headers,
    })

    return (await response.json()) as UnsplashResponse
  }
}
