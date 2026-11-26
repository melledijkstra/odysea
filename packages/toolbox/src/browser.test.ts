import { afterEach, describe, expect, it, vi } from 'vitest'
import { onPageVisible } from './browser'

class FakeDocument extends EventTarget {
  visibilityState: 'visible' | 'hidden' = 'visible'
}

describe('onPageVisible', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('should safely return a no-op cleanup when document is undefined (SSR / Node)', () => {
    const callback = vi.fn()
    const cleanup = onPageVisible(callback, { immediate: true })

    expect(callback).not.toHaveBeenCalled()
    expect(() => cleanup()).not.toThrow()
  })

  it('should safely return a no-op cleanup when window exists without document or without addEventListener', () => {
    vi.stubGlobal('window', {})
    const callback = vi.fn()

    const cleanup1 = onPageVisible(callback, { immediate: true })
    expect(callback).not.toHaveBeenCalled()
    expect(() => cleanup1()).not.toThrow()

    vi.stubGlobal('document', { visibilityState: 'visible' })
    const cleanup2 = onPageVisible(callback, { immediate: true })
    expect(callback).not.toHaveBeenCalled()
    expect(() => cleanup2()).not.toThrow()
  })

  it('should invoke callback only when visibilityState transitions to visible', () => {
    const fakeDoc = new FakeDocument()
    vi.stubGlobal('document', fakeDoc)
    const callback = vi.fn()

    const cleanup = onPageVisible(callback)
    expect(callback).not.toHaveBeenCalled()

    fakeDoc.visibilityState = 'visible'
    fakeDoc.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toHaveBeenCalledTimes(1)

    fakeDoc.visibilityState = 'hidden'
    fakeDoc.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toHaveBeenCalledTimes(1)

    fakeDoc.visibilityState = 'visible'
    fakeDoc.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toHaveBeenCalledTimes(2)

    cleanup()
  })

  it('should invoke callback immediately when immediate is true and document is visible', () => {
    const fakeDoc = new FakeDocument()
    fakeDoc.visibilityState = 'visible'
    vi.stubGlobal('document', fakeDoc)
    const callback = vi.fn()

    const cleanup = onPageVisible(callback, { immediate: true })
    expect(callback).toHaveBeenCalledTimes(1)

    fakeDoc.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toHaveBeenCalledTimes(2)

    cleanup()
  })

  it('should not invoke callback immediately when immediate is true but document is hidden', () => {
    const fakeDoc = new FakeDocument()
    fakeDoc.visibilityState = 'hidden'
    vi.stubGlobal('document', fakeDoc)
    const callback = vi.fn()

    const cleanup = onPageVisible(callback, { immediate: true })
    expect(callback).not.toHaveBeenCalled()

    fakeDoc.visibilityState = 'visible'
    fakeDoc.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toHaveBeenCalledTimes(1)

    cleanup()
  })

  it('should not invoke callback immediately when immediate is false or omitted', () => {
    const fakeDoc = new FakeDocument()
    fakeDoc.visibilityState = 'visible'
    vi.stubGlobal('document', fakeDoc)
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    const cleanup1 = onPageVisible(callback1)
    const cleanup2 = onPageVisible(callback2, { immediate: false })

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()

    cleanup1()
    cleanup2()
  })

  it('should remove listener on cleanup and be idempotent across multiple cleanup calls', () => {
    const fakeDoc = new FakeDocument()
    const removeSpy = vi.spyOn(fakeDoc, 'removeEventListener')
    vi.stubGlobal('document', fakeDoc)
    const callback = vi.fn()

    const cleanup = onPageVisible(callback)
    fakeDoc.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toHaveBeenCalledTimes(1)

    cleanup()
    cleanup()
    cleanup()

    expect(removeSpy).toHaveBeenCalledTimes(1)

    fakeDoc.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not leak a listener if immediate callback throws synchronously', () => {
    const fakeDoc = new FakeDocument()
    fakeDoc.visibilityState = 'visible'
    const addSpy = vi.spyOn(fakeDoc, 'addEventListener')
    vi.stubGlobal('document', fakeDoc)

    expect(() =>
      onPageVisible(
        () => {
          throw new Error('boom')
        },
        { immediate: true }
      )
    ).toThrow('boom')

    expect(addSpy).not.toHaveBeenCalled()
  })
})
