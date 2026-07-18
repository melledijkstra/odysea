import { BaseClient } from './baseclient'

export class ApiKeyBaseClient extends BaseClient {
  protected apiKey: string | (() => string | undefined) | undefined
  protected urlQueryKeyName = 'key'

  constructor(
    baseUrl: string,
    apiKey: string | (() => string | undefined) | undefined
  ) {
    super(baseUrl)

    this.apiKey = apiKey

    if (this.constructor === ApiKeyBaseClient) {
      throw new Error(
        'ApiKeyBaseClient is abstract and cannot be instantiated directly.'
      )
    }
  }

  async request<T>(
    endpoint: string,
    config?: RequestInit
  ): Promise<T | undefined> {
    const key = this.getApiKey()
    if (!key) {
      throw new Error(
        'ApiKeyBaseClient needs to be instantiated with a valid API key.'
      )
    }
    const [path, query] = endpoint.split('?')
    const searchParams = new URLSearchParams(query || '')
    searchParams.set(this.urlQueryKeyName, key)
    endpoint = path
    return super.request(endpoint, config, searchParams)
  }

  getApiKey(): string | undefined {
    return typeof this.apiKey === 'function' ? this.apiKey() : this.apiKey
  }

  setApiKey(token: string | (() => string | undefined)) {
    this.apiKey = token
  }
}
