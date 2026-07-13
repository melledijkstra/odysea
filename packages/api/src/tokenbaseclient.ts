import { BaseClient } from './baseclient'

export type TokenProvider = string | (() => string | Promise<string | undefined>)

export class TokenBaseClient extends BaseClient {
  protected token: TokenProvider

  constructor(
    baseUrl: string,
    token: TokenProvider,
  ) {
    super(baseUrl)

    this.token = token

    if (this.constructor === TokenBaseClient) {
      throw new Error(
        'TokenBaseClient is abstract and cannot be instantiated directly.',
      )
    }
  }

  async _getHeaders(): Promise<HeadersInit> {
    const token = typeof this.token === 'function' ? await this.token() : this.token
    const baseHeaders = await super._getHeaders()

    if (!token) {
      return baseHeaders
    }

    return {
      ...baseHeaders,
      Authorization: `Bearer ${token}`,
    }
  }

  getAccessToken() {
    return this.token
  }

  setAccessToken(token: TokenProvider) {
    this.token = token
  }
}
