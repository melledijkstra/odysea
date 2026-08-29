import { GoogleAuthClient, createGoogleAuthConfig } from '@melledijkstra/auth'
import { FileStorage } from '@melledijkstra/storage'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const storagePath = path.resolve('.tokens.json')
const storage = new FileStorage(storagePath)

const redirectUri =
  process.env['GOOGLE_REDIRECT_URI'] || 'http://localhost:5050/oauth/callback'

const config = createGoogleAuthConfig()
// Override scope if specified in environment variables
if (process.env['GOOGLE_SCOPES']) {
  config.scopes = process.env['GOOGLE_SCOPES'].split(' ')
}

export const authClient = new GoogleAuthClient(config, redirectUri, {
  storage,
})
