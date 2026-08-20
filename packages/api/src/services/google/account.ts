import { TokenBaseClient } from '../../tokenbaseclient'
import type { AuthClient } from '@melledijkstra/auth'

export type Account = {
  name: string
  picture: string
  email: string
  given_name: string
  family_name: string
}

export class GoogleAccountApiClient extends TokenBaseClient {
  constructor(auth: AuthClient) {
    super('https://www.googleapis.com', () => auth.getAuthToken())
  }

  async fetchAccountInfo(): Promise<Account | undefined> {
    return this.request<Account>('/oauth2/v3/userinfo')
  }
}
