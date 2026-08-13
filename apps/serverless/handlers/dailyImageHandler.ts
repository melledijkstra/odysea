import { Context } from 'hono'
import { EXTENSION_ID, UNSPLASH_URL } from '../constants.ts'

const UNSPLASH_API_KEY = Deno.env.get('UNSPLASH_API_KEY')

export async function dailyImageHandler(context: Context): Promise<Response> {
  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'application/json')

  const extensionId = context.req.header('x-extension-id') ?? ''

  console.log('Extension ID:', extensionId)

  if (extensionId !== EXTENSION_ID) {
    return context.json(
      {
        message: 'Forbidden: Invalid extension ID',
        extension_id: extensionId,
      },
      403
    )
  }

  if (!UNSPLASH_API_KEY) {
    return context.json(
      {
        message:
          'Bad Request: API key not set, check your environment variables',
      },
      400
    )
  }

  const url = new URL(context.req.url)
  const unsplashUrl = new URL(UNSPLASH_URL)
  unsplashUrl.search = url.search
  unsplashUrl.searchParams.set('orientation', 'landscape')
  unsplashUrl.searchParams.set('client_id', UNSPLASH_API_KEY)

  try {
    console.log('Fetching image from:', unsplashUrl)
    const response = await fetch(unsplashUrl)
    if (!response.ok) {
      return context.json(
        { message: 'Failed to fetch image from provider' },
        200
      )
    }
    const data = await response.json()
    return context.json(data, { headers: responseHeaders })
  } catch (err) {
    console.error('Error fetching image:', err, unsplashUrl)
    return context.json(
      { message: 'Bad Gateway', error: String(err) },
      { status: 502, headers: responseHeaders }
    )
  }
}
