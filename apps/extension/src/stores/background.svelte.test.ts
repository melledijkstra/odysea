import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { background, setBackgroundImage } from './background.svelte'

describe('background store', () => {
  let originalImage: typeof globalThis.Image

  beforeEach(() => {
    originalImage = globalThis.Image
    vi.stubGlobal('Image', class {
      _src: string = ''
      get src() {
        return this._src
      }

      set src(value: string) {
        this._src = value
        setTimeout(() => {
          this.onload?.()
        }, 0)
      }

      onload: (() => void) | null = null
      onerror: ((error: Event) => void) | null = null
    })
  })

  afterEach(() => {
    globalThis.Image = originalImage
    vi.unstubAllGlobals()
  })

  it('should have undefined as initial value', () => {
    expect(background.url).toBeUndefined()
  })

  it('should update store when setBackgroundImage is called with a valid URL', async () => {
    const url = 'https://example.com/image.jpg'
    await setBackgroundImage(url)
    expect(background.url).toBe(url)
  })
})
