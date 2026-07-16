import { Router } from 'express'
import { db } from '../db.ts'
import { FocusSession } from '../types.ts'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const sessions = await db<FocusSession>('focus-sessions').select('*')
    res.json(sessions)
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    return
  }
})

router.post('/', async (req, res) => {
  const { duration, task } = req.body ?? {}
  if (!duration || !task) {
    res.status(400).json({ error: 'Duration and task are required' })
    return
  }
  try {
    const [session] = await db<FocusSession>('focus-sessions')
      .insert({ duration, task })
      .returning('*')
    res.status(201).json(session)
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    return
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { duration, task } = req.body
  if (!duration || !task) {
    res.status(400).json({ error: 'Duration and task are required' })
    return
  }
  try {
    const [session] = await db<FocusSession>('focus-sessions')
      .where({ id: Number.parseInt(id) })
      .update({ duration, task })
      .returning('*')
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    res.json(session)
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    return
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const session = await db<FocusSession>('focus-sessions')
      .select('*')
      .where({ id: Number.parseInt(id) })
      .first()
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    res.json(session)
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    return
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const deleted = await db<FocusSession>('focus-sessions')
      .where({ id: Number.parseInt(id) })
      .del()
    if (!deleted) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    res.status(204).send()
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    return
  }
})

export { router }
