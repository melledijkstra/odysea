import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { router as focusSessionsRouter } from './routes/focus-sessions'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/status', (_req, res) => {
  res.status(200).send('OK')
})

app.use('/focus-sessions', focusSessionsRouter)

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`Odysea Server running on port ${PORT}`)
})
