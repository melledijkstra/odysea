import { BaseClient } from "./baseclient"

export class ApiKeyBaseClient extends BaseClient {
  protected apiKey: string | (() => string)
  protected urlQueryKeyName = 'key'

  constructor(
    baseUrl: string,
    apiKey: string | (() => string),
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
    config?: RequestInit,
  ): Promise<T | undefined> {
    const key = this.getApiKey()
    if (!key) {
      throw new Error('API Key is missing')
    }
    const [path, query] = endpoint.split('?')
    const searchParams = new URLSearchParams(query || '')
    searchParams.set(this.urlQueryKeyName, key)
    endpoint = path
    return super.request(endpoint, config, searchParams);
  }

  getApiKey(): string {
    return typeof this.apiKey === 'function' ? this.apiKey() : this.apiKey
  }

  setApiKey(token: string | (() => string)) {
    this.apiKey = token
  }
}
