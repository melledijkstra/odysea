import fs from 'node:fs'
import path from 'node:path'
import { GoogleAuthClient } from '@melledijkstra/auth'
import { FileStorage } from '@melledijkstra/storage'
import { config, type LooperConfig } from './config.js'

export function createGoogleAuthClient(
  appConfig: LooperConfig = config
): GoogleAuthClient | null {
  if (!appConfig.google.configured || !appConfig.google.clientId) {
    return null
  }

  fs.mkdirSync(path.dirname(appConfig.paths.tokensPath), { recursive: true })
  const storage = new FileStorage(appConfig.paths.tokensPath)

  return new GoogleAuthClient(
    {
      clientId: appConfig.google.clientId,
      ...(appConfig.google.clientSecret !== undefined && {
        clientSecret: appConfig.google.clientSecret,
      }),
      initialScope: appConfig.google.scopes,
    },
    {
      storage,
      redirectUrl: appConfig.google.redirectUri,
    }
  )
}

export const authClient: GoogleAuthClient | null =
  createGoogleAuthClient(config)
