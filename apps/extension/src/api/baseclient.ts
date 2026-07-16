export class BaseClient {
  private readonly BASE_URL: string

  constructor(
    baseUrl: string,
  ) {
    if (!baseUrl) {
      throw new Error('BaseClient needs to be instatiated with a base URL')
    }

    this.BASE_URL = baseUrl

    if (this.constructor === BaseClient) {
      throw new Error(
        'BaseClient is abstract and cannot be instantiated directly.',
      )
    }
  }

  _getHeaders(): HeadersInit {
    return {
      accept: 'application/json',
    }
  }

  async request<T>(
    endpoint: string,
    config?: RequestInit,
    queryParams?: URLSearchParams,
  ): Promise<T | undefined> {
    const url = new URL(`${this.BASE_URL}${endpoint}`)

    if (queryParams) {
      url.search = queryParams.toString()
    }

    const headers = this._getHeaders()

    const response = await fetch(url.toString(), {
      ...config,
      headers: {
        ...headers,
        ...config?.headers,
      },
    })

    if (
      response.ok
      && response.status !== 204
      && response.headers.get('content-type')?.includes('application/json')
    ) {
      return (await response.json()) as T
    }
  }

  getBaseUrl() {
    return this.BASE_URL
  }
}
