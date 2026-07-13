import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CliAuthFlowHandler } from './cli-handler'
import * as readline from 'node:readline/promises'

vi.mock('node:readline/promises', () => {
  return {
    createInterface: vi.fn(),
  }
})

describe('CliAuthFlowHandler', () => {
  let handler: CliAuthFlowHandler

  beforeEach(() => {
    vi.clearAllMocks()
    handler = new CliAuthFlowHandler()
  })

  it('should print the URL and return the pasted redirect URL', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const mockQuestion = vi.fn().mockResolvedValue('http://localhost:3000/callback?code=123&state=abc')
    const mockClose = vi.fn()

    vi.mocked(readline.createInterface).mockReturnValue({
      question: mockQuestion,
      close: mockClose,
    } as unknown as readline.Interface)

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth?client_id=123')
    const result = await handler.open(url)

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('https://accounts.google.com'))
    expect(mockQuestion).toHaveBeenCalledWith(expect.stringContaining('Paste the redirect URL here'))
    expect(mockClose).toHaveBeenCalled()
    expect(result.href).toBe('http://localhost:3000/callback?code=123&state=abc')
  })
})
