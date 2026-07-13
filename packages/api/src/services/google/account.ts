import { AuthClient } from '@melledijkstra/auth'
import { GoogleAuthProvider } from '@melledijkstra/auth'

export type Account = {
  name: string
  picture: string
  email: string
}

const client = new AuthClient(new GoogleAuthProvider())

export async function fetchAccountInfo(): Promise<Account | undefined> {
  try {
    const token = await client.getAuthToken()
    if (!token) {
      return
    }

    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
    const data = (await response.json()) as Account

    return data
  }
  catch (error) {
    console.error('Error fetching user info:', error)
  }
}
