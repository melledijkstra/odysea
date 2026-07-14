import { vi } from 'vitest'
import browser from '@/mocks/webextension-polyfill'

vi.stubGlobal('browser', browser)
vi.stubGlobal('chrome', browser)

vi.mock('webextension-polyfill')
