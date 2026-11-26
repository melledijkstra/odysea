import { beforeEach, describe, expect, it, vi } from 'vitest'
import browser from 'webextension-polyfill'
import { createMessage } from './messaging'

describe('createMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send messages with identifier and data', async () => {
    vi.mocked(browser.runtime.sendMessage).mockResolvedValueOnce({ ok: true })
    const ping = createMessage<{ value: number }, { ok: boolean }>('PING')

    const response = await ping.send({ value: 42 })

    expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
      identifier: 'PING',
      data: { value: 42 },
    })
    expect(response).toEqual({ ok: true })
  })

  it('should invoke callback for matching identifier and return an unsubscribe cleanup function', async () => {
    const ping = createMessage<{ value: number }, { doubled: number }>('PING')
    const handler = vi.fn(({ value }: { value: number }) => ({
      doubled: value * 2,
    }))

    const unsubscribe = ping.on(handler)

    expect(browser.runtime.onMessage.addListener).toHaveBeenCalledTimes(1)
    const registeredListener = vi.mocked(browser.runtime.onMessage.addListener)
      .mock.calls[0][0]

    // Non-matching message should be ignored
    const ignored = registeredListener(
      { identifier: 'OTHER', data: { value: 1 } },
      {} as browser.Runtime.MessageSender,
      vi.fn()
    )
    expect(ignored).toBeUndefined()
    expect(handler).not.toHaveBeenCalled()

    // Matching message should invoke handler and resolve with response
    const result = await registeredListener(
      { identifier: 'PING', data: { value: 21 } },
      {} as browser.Runtime.MessageSender,
      vi.fn()
    )
    expect(handler).toHaveBeenCalledWith({ value: 21 })
    expect(result).toEqual({ doubled: 42 })

    // Calling unsubscribe removes the exact registered listener
    unsubscribe()
    expect(browser.runtime.onMessage.removeListener).toHaveBeenCalledTimes(1)
    expect(browser.runtime.onMessage.removeListener).toHaveBeenCalledWith(
      registeredListener
    )
  })
})
