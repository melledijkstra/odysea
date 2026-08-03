import { Logger } from '@melledijkstra/toolbox'
import type { UnsplashResponse } from '../definitions/unsplash'

const ENDPOINT = '/api/daily-image'

export interface UnsplashConfig {
  host: string
  query?: string
  collections?: string[]
}

export class UnsplashClient {
  public logger: Logger = new Logger('UnsplashClient')
  public config: UnsplashConfig

  constructor(config: UnsplashConfig) {
    this.config = config
    this.logger.log(
      'UnsplashClient initialized with host:',
      this.getConfig().host
    )
  }

  getConfig(): UnsplashConfig {
    return this.config
  }

  setHost(host: string) {
    if (!host || host.trim() === '') {
      throw new Error('Serverless host domain cannot be empty')
    }
    this.logger.log('Setting new host for UnsplashClient:', host)
    this.getConfig().host = host
  }

  getQueryParameters(): URLSearchParams {
    const params = new URLSearchParams()
    const config = this.getConfig()
    if (config.query) {
      params.set('query', config.query)
    }
    if (config.collections && config.collections.length > 0) {
      params.set('collections', config.collections.join(','))
    }
    return params
  }

  getHeaders(): Headers {
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    return headers
  }

  async fetchUnsplashImage(): Promise<UnsplashResponse> {
    const config = this.getConfig()
    this.logger.log('Fetching Unsplash image from', {
      host: config.host,
      endpoint: ENDPOINT,
      query: config.query,
    })
    const serverUrl = new URL(ENDPOINT, config.host)

    const queryParams = this.getQueryParameters()
    serverUrl.search = queryParams.toString()

    const headers = this.getHeaders()

    const response = await fetch(serverUrl, {
      headers: headers,
    })

    return (await response.json()) as UnsplashResponse
  }
}
