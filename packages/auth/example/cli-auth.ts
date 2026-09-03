import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { FileStorage } from '@melledijkstra/storage'
import {
  AuthClient,
  CliAuthFlowHandler,
  GoogleAuthClient,
  GithubAuthClient,
  SpotifyAuthClient,
} from '../src'

const AUTH_PROVIDERS = ['google', 'github', 'spotify'] as const

type OAuthProvider = (typeof AUTH_PROVIDERS)[number]

const isSupportedAuthProvider = (provider: string): provider is OAuthProvider =>
  AUTH_PROVIDERS.includes(provider as OAuthProvider)

const rl = readline.createInterface({ input, output })

try {
  console.log('--- CLI OAuth Authentication Test ---\n')

  const providerNameInput = await rl.question(
    `Enter Provider (${AUTH_PROVIDERS.join(' | ')}): `
  )

  const providerName = providerNameInput.trim().toLowerCase()

  if (!isSupportedAuthProvider(providerName)) {
    console.error(`Error: Unsupported provider '${providerName}'`)
    process.exit(1)
  }

  const redirectUrlInput = await rl.question(
    'Enter Redirect URL [default: http://localhost:3000/callback]: '
  )
  const redirectUrl =
    redirectUrlInput.trim() || 'http://localhost:3000/callback'

  const storage = new FileStorage()
  const handler = new CliAuthFlowHandler()
  const options = { storage, handler, redirectUrl }

  let authClient: AuthClient

  switch (providerName) {
    case 'google':
      authClient = new GoogleAuthClient(
        {
          clientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
          clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
          initialScope: ['openid', 'profile'],
        },
        options
      )
      break
    case 'github':
      authClient = new GithubAuthClient(
        {
          clientId: process.env['GITHUB_CLIENT_ID'] ?? '',
          clientSecret: process.env['GITHUB_CLIENT_SECRET'],
          initialScope: ['user'],
        },
        options
      )
      break
    case 'spotify':
      authClient = new SpotifyAuthClient(
        {
          clientId: process.env['SPOTIFY_CLIENT_ID'] ?? '',
          clientSecret: process.env['SPOTIFY_CLIENT_SECRET'],
          initialScope: ['user'],
        },
        options
      )
      break
    default:
      console.error(`Error: Unsupported provider '${providerName}'`)
      process.exit(1)
  }

  console.log(
    '\nInitializing AuthClient with FileStorage and CliAuthFlowHandler...'
  )

  console.log('Executing interactive authentication flow...')
  const token = await authClient.getAuthToken(true)

  if (token) {
    console.log('\n========================================')
    console.log('Authentication Successful!')
    console.log('========================================')
    console.log(`Access Token: ${token}`)

    // Test retrieving token non-interactively
    console.log(
      '\nVerifying token storage by fetching token non-interactively...'
    )
    const storedToken = await authClient.getAuthToken(false)
    console.log(
      `Stored Token retrieved: ${storedToken ? 'YES (matches)' : 'NO'}`
    )
  } else {
    console.log('\nAuthentication failed or was cancelled.')
  }
} catch (error) {
  console.error('\nAn error occurred:', error)
} finally {
  rl.close()
}
