import { Router, Request, Response, RequestHandler } from 'express'
import { db } from '../db.ts'
import { FocusSession } from '../types.ts'

const router = Router()

const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  async (req, res) => {
    try {
      await fn(req, res)
    } catch (err) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : String(err) })
    }
  }

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const sessions = await db<FocusSession>('focus-sessions').select('*')
    res.json(sessions)
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { duration, task } = req.body ?? {}
    if (!duration || !task || Array.isArray(req.body.id)) {
      res
        .status(400)
        .json({ error: 'Duration, task, and valid ID are required' })
      return
    }
    const [session] = await db<FocusSession>('focus-sessions')
      .insert({ duration, task })
      .returning('*')
    res.status(201).json(session)
  })
)

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { duration, task } = req.body
    if (!duration || !task || Array.isArray(id)) {
      res
        .status(400)
        .json({ error: 'Duration, task, and valid ID are required' })
      return
    }
    const [session] = await db<FocusSession>('focus-sessions')
      .where({ id: Number.parseInt(id) })
      .update({ duration, task })
      .returning('*')
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    res.json(session)
  })
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    if (Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid session ID' })
      return
    }
    const session = await db<FocusSession>('focus-sessions')
      .select('*')
      .where({ id: Number.parseInt(id) })
      .first()
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    res.json(session)
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    if (Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid session ID' })
      return
    }
    const deleted = await db<FocusSession>('focus-sessions')
      .where({ id: Number.parseInt(id) })
      .del()
    if (!deleted) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    res.status(204).send()
  })
)

export { router }
