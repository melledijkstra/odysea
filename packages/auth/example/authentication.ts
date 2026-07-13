import { createServer } from 'http'
import { AuthClient, GoogleAuthConfig } from '../src'

// const clientId = process.env.GITHUB_CLIENT_ID
// const clientSecret = process.env.GITHUB_CLIENT_SECRET
// const scopes = ['user']

const PORT = 8000
const redirectUrl = `http://localhost:${PORT}/oauth/callback`

const authClient = new AuthClient(new GoogleAuthConfig(), redirectUrl)

console.log('Trying to authenticate...')

const authUrl = await authClient.createAuthUrl()

console.log(authUrl.href)

const server = createServer(async (req, res) => {
  const requestUrl = URL.parse(req.url!, `http://localhost:${PORT}`)

  // Filter for the callback route
  if (requestUrl?.pathname === '/oauth/callback') {
    const code = requestUrl.searchParams.get('code')!
    const state = requestUrl.searchParams.get('state')

    try {
      // 5. Exchange Code for Tokens
      const tokens = await authClient.validate(code, state)

      console.log('\nSUCCESS! Save these credentials safely:')
      console.log('-----------------------------------------')
      console.log(`ACCESS_TOKEN: ${tokens.accessToken()}`)
      console.log(`REFRESH_TOKEN: ${tokens.hasRefreshToken() ? tokens.refreshToken() : 'N/A'}`)
      console.log('-----------------------------------------')
      console.log('data: ', tokens.data)

      res.end('Authentication successful! You can close this tab.')
    }
    catch (e) {
      console.error(e)
      res.end('Authentication failed.')
    }
    finally {
      server.close()
      process.exit(0)
    }
  }

  res.statusCode = 404
  res.end('Not found!')
})

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}...`)
})
