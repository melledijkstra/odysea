import { Context } from 'hono'
import { EXTENSION_ID, UNSPLASH_URL } from '../constants.ts'

const UNSPLASH_API_KEY = Deno.env.get('UNSPLASH_API_KEY')

export async function dailyImageHandler(c: Context): Promise<Response> {
  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'application/json')

  const extensionId = c.req.header('x-extension-id') ?? ''

  console.log('Extension ID:', extensionId)

  if (extensionId !== EXTENSION_ID) {
    return c.json(
      {
        message: 'Forbidden: Invalid extension ID',
        extension_id: extensionId,
      },
      403
    )
  }

  if (!UNSPLASH_API_KEY) {
    return c.json(
      {
        message:
          'Bad Request: API key not set, check your environment variables',
      },
      400
    )
  }

  const url = new URL(c.req.url)
  const unsplashUrl = new URL(UNSPLASH_URL)
  unsplashUrl.search = url.search
  unsplashUrl.searchParams.set('orientation', 'landscape')
  unsplashUrl.searchParams.set('client_id', UNSPLASH_API_KEY)

  try {
    console.log('Fetching image from:', unsplashUrl)
    return await fetch(unsplashUrl)
  } catch (err) {
    console.error('Error fetching image:', err, unsplashUrl)
    return c.json(
      { message: 'Bad Gateway', error: String(err) },
      { status: 502, headers: responseHeaders }
    )
  }
}
