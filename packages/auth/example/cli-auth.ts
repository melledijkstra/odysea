import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { FileStorage } from '@melledijkstra/storage'
import { AuthClient, CliAuthFlowHandler, AuthConfig, OauthProvider } from '../src'
import { SpotifyAuthConfig, FitbitAuthConfig, GithubAuthConfig, GoogleAuthConfig } from '../src/providers'

const rl = readline.createInterface({ input, output })

try {
  console.log('--- CLI OAuth Authentication Test ---\n')

  const providerNameInput = await rl.question('Enter Provider (google | github | spotify | fitbit) [default: github]: ')
  const providerName = (providerNameInput.trim().toLowerCase() || 'github') as OauthProvider

  const redirectUrlInput = await rl.question('Enter Redirect URL [default: http://localhost:3000/callback]: ')
  const redirectUrl = redirectUrlInput.trim() || 'http://localhost:3000/callback'

  let config: AuthConfig

  switch (providerName) {
    case 'google':
      config = new GoogleAuthConfig()
      break
    case 'github':
      config = new GithubAuthConfig()
      break
    case 'spotify':
      config = new SpotifyAuthConfig()
      break
    case 'fitbit':
      config = new FitbitAuthConfig()
      break
    default:
      console.error(`Error: Unsupported provider '${providerName}'`)
      process.exit(1)
  }

  console.log('\nInitializing AuthClient with FileStorage and CliAuthFlowHandler...')

  const storage = new FileStorage()
  const handler = new CliAuthFlowHandler()
  const authClient = new AuthClient(config, redirectUrl, {
    storage,
    handler,
  })

  console.log('Executing interactive authentication flow...')
  const token = await authClient.getAuthToken(true)

  if (token) {
    console.log('\n========================================')
    console.log('Authentication Successful!')
    console.log('========================================')
    console.log(`Access Token: ${token}`)

    // Test retrieving token non-interactively
    console.log('\nVerifying token storage by fetching token non-interactively...')
    const storedToken = await authClient.getAuthToken(false)
    console.log(`Stored Token retrieved: ${storedToken ? 'YES (matches)' : 'NO'}`)
  }
  else {
    console.log('\nAuthentication failed or was cancelled.')
  }
}
catch (error) {
  console.error('\nAn error occurred:', error)
}
finally {
  rl.close()
}
