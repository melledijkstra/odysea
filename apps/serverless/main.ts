import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { showRoutes } from 'hono/dev'
import { dailyImageHandler } from './handlers/dailyImageHandler.ts'
import { ALLOWED_ORIGIN } from './constants.ts'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: ALLOWED_ORIGIN,
    maxAge: 3600,
  })
)

app.get('/', (c) => {
  return c.text('Hey there!')
})

app.get('/api/daily-image', dailyImageHandler)

showRoutes(app)

Deno.serve(app.fetch)
