import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { background, setBackgroundImage } from './background.svelte'

describe('background store', () => {
  let originalImage: typeof globalThis.Image

  beforeEach(() => {
    originalImage = globalThis.Image
    vi.stubGlobal(
      'Image',
      class {
        _src: string = ''
        get src() {
          return this._src
        }

        set src(value: string) {
          this._src = value
          setTimeout(() => {
            if (value.includes('fail')) {
              this.onerror?.(new Event('error'))
            } else {
              this.onload?.()
            }
          }, 0)
        }

        onload: (() => void) | null = null
        onerror: ((error: Event) => void) | null = null
      }
    )
  })

  afterEach(() => {
    globalThis.Image = originalImage
    vi.unstubAllGlobals()
  })

  it('should have undefined as initial value', () => {
    expect(background.url).toBeUndefined()
  })

  it('should have error as false initially', () => {
    expect(background.error).toBe(false)
  })

  it('should update store when setBackgroundImage is called with a valid URL', async () => {
    const url = 'https://example.com/image.jpg'
    await setBackgroundImage(url)
    expect(background.url).toBe(url)
    expect(background.error).toBe(false)
  })

  it('should set error to true and url to undefined when setBackgroundImage fails', async () => {
    const url = 'https://example.com/fail-image.jpg'
    await setBackgroundImage(url)
    expect(background.url).toBeUndefined()
    expect(background.error).toBe(true)
  })

  it('should reset error to false when setBackgroundImage succeeds after a failure', async () => {
    const failUrl = 'https://example.com/fail-image.jpg'
    await setBackgroundImage(failUrl)
    expect(background.url).toBeUndefined()
    expect(background.error).toBe(true)

    const successUrl = 'https://example.com/image.jpg'
    await setBackgroundImage(successUrl)
    expect(background.url).toBe(successUrl)
    expect(background.error).toBe(false)
  })
})
