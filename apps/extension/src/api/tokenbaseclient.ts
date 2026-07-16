import { BaseClient } from './baseclient'

export class TokenBaseClient extends BaseClient {
  protected token: string

  constructor(
    baseUrl: string,
    token: string,
  ) {
    super(baseUrl)

    this.token = token

    if (this.constructor === TokenBaseClient) {
      throw new Error(
        'TokenBaseClient is abstract and cannot be instantiated directly.',
      )
    }
  }

  _getHeaders(): HeadersInit {
    return {
      ...super._getHeaders(),
      Authorization: `Bearer ${this.token}`,
    }
  }

  getAccessToken() {
    return this.token
  }

  setAccessToken(token: string) {
    this.token = token
  }
}
