import { GoogleAuthClient } from '@melledijkstra/auth'
import { FileStorage } from '@melledijkstra/storage'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const storagePath = path.resolve('.tokens.json')
const storage = new FileStorage(storagePath)

const redirectUri =
  process.env['GOOGLE_REDIRECT_URI'] || 'http://localhost:5050/oauth/callback'

const initialScope = process.env['GOOGLE_SCOPES']
  ? process.env['GOOGLE_SCOPES'].split(' ')
  : ['openid', 'profile']

export const authClient = new GoogleAuthClient(
  {
    clientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    initialScope,
  },
  {
    storage,
    redirectUrl: redirectUri,
  }
)
