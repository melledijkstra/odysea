import {
  chromium,
  type BrowserContext,
  type Page,
  type Worker,
} from '@playwright/test'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXTENSION_PATH = path.resolve(__dirname, '../dist')
const SESSION_FILE = path.resolve('/tmp/odysea-inspect-session.json')
const USER_DATA_DIR = path.resolve('/tmp/odysea-inspect-profile')
const LOGS_FILE = path.resolve('/tmp/odysea-inspect-logs.json')
const CDP_PORT = 9333

interface SessionInfo {
  wsEndpoint: string
  extensionId: string
  port: number
}

interface NetworkLog {
  url: string
  method: string
  resourceType: string
  status?: number
  contentType?: string
  contentLength?: string | number
  durationMs?: number
  timestamp: string
}

interface ConsoleLog {
  type: string
  text: string
  timestamp: string
}

interface ActivityLogs {
  network: NetworkLog[]
  console: ConsoleLog[]
}

function cleanStaleLocks(dir: string) {
  if (!existsSync(dir)) return
  const lockFiles = [
    'SingletonLock',
    'SingletonSocket',
    'SingletonCookie',
    'RunningChromeVersion',
  ]
  for (const file of lockFiles) {
    const p = path.join(dir, file)
    try {
      if (existsSync(p)) unlinkSync(p)
    } catch (err) {
      void err
    }
  }
}

function loadLogs(): ActivityLogs {
  if (existsSync(LOGS_FILE)) {
    try {
      return JSON.parse(readFileSync(LOGS_FILE, 'utf-8'))
    } catch (err) {
      void err
    }
  }
  return { network: [], console: [] }
}

function appendLog(
  type: 'network' | 'console',
  entry: NetworkLog | ConsoleLog
) {
  const logs = loadLogs()
  if (type === 'network') {
    logs.network.push(entry as NetworkLog)
    if (logs.network.length > 200) logs.network.shift()
  } else {
    logs.console.push(entry as ConsoleLog)
    if (logs.console.length > 200) logs.console.shift()
  }
  try {
    writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2))
  } catch (err) {
    void err
  }
}

async function getOrCreateContext(): Promise<{
  context: BrowserContext
  extensionId: string
  isNew: boolean
}> {
  // 1. Try to connect to existing CDP session
  try {
    const browser = await chromium.connectOverCDP(
      `http://127.0.0.1:${CDP_PORT}`,
      {
        timeout: 1500,
      }
    )
    const contexts = browser.contexts()
    if (contexts.length > 0) {
      let extId = 'kaeibbjbbioodhkpgclmhdhnoggcikhi'
      if (existsSync(SESSION_FILE)) {
        try {
          const session: SessionInfo = JSON.parse(
            readFileSync(SESSION_FILE, 'utf-8')
          )
          if (session.extensionId) extId = session.extensionId
        } catch (err) {
          void err
        }
      }
      return {
        context: contexts[0],
        extensionId: extId,
        isNew: false,
      }
    }
  } catch (err) {
    void err
  }

  // 2. Clear stale session files and profile locks
  try {
    unlinkSync(SESSION_FILE)
  } catch (err) {
    void err
  }
  try {
    unlinkSync(LOGS_FILE)
  } catch (err) {
    void err
  }
  cleanStaleLocks(USER_DATA_DIR)

  // 3. Launch fresh persistent context
  const isHeadless = process.argv.includes('--headless')
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: isHeadless,
    args: [
      `--remote-debugging-port=${CDP_PORT}`,
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-sandbox',
    ],
  })

  let extensionId = 'kaeibbjbbioodhkpgclmhdhnoggcikhi'
  let sw: Worker | null = context.serviceWorkers()[0] || null
  if (!sw) {
    try {
      sw = await context.waitForEvent('serviceworker', { timeout: 4000 })
    } catch (err) {
      void err
    }
  }

  if (sw) {
    const swHost = new URL(sw.url()).hostname
    if (swHost) extensionId = swHost
  }

  const sessionInfo: SessionInfo = {
    wsEndpoint: `http://127.0.0.1:${CDP_PORT}`,
    extensionId,
    port: CDP_PORT,
  }
  writeFileSync(SESSION_FILE, JSON.stringify(sessionInfo, null, 2))

  // Listen for background requests & logs on context
  context.on('page', (newPage) => {
    attachListeners(newPage)
  })

  context.pages().forEach((p) => attachListeners(p))

  return { context, extensionId, isNew: true }
}

function attachListeners(page: Page) {
  const reqStartTimes = new Map<string, number>()

  page.on('request', (req) => {
    reqStartTimes.set(req.url(), Date.now())
  })

  page.on('response', (res) => {
    const startTime = reqStartTimes.get(res.url()) || Date.now()
    const durationMs = Date.now() - startTime
    appendLog('network', {
      url: res.url(),
      method: res.request().method(),
      resourceType: res.request().resourceType(),
      status: res.status(),
      contentType: res.headers()['content-type'],
      contentLength: res.headers()['content-length'],
      durationMs,
      timestamp: new Date().toISOString(),
    })
  })

  page.on('console', (msg) => {
    appendLog('console', {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString(),
    })
  })

  page.on('pageerror', (err) => {
    appendLog('console', {
      type: 'error',
      text: `[PageError]: ${err.message}`,
      timestamp: new Date().toISOString(),
    })
  })
}

function resolvePageUrl(target: string, extensionId: string): string {
  const normalized = target.toLowerCase().trim()
  if (
    normalized === 'home' ||
    normalized === 'newtab' ||
    normalized === 'index' ||
    normalized === 'index.html'
  ) {
    return `chrome-extension://${extensionId}/index.html`
  }
  if (normalized === 'popup' || normalized === 'popup.html') {
    return `chrome-extension://${extensionId}/popup.html`
  }
  if (
    normalized === 'options' ||
    normalized === 'options.html' ||
    normalized === 'settings'
  ) {
    return `chrome-extension://${extensionId}/options.html`
  }
  if (normalized === 'debug' || normalized === 'debug.html') {
    return `chrome-extension://${extensionId}/debug.html`
  }
  if (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('chrome-extension://')
  ) {
    return target
  }
  return `chrome-extension://${extensionId}/${target.replace(/^\//, '')}`
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--headless')
  const command = args[0] || 'status'

  if (command === 'close' || command === 'stop') {
    try {
      const browser = await chromium.connectOverCDP(
        `http://127.0.0.1:${CDP_PORT}`,
        {
          timeout: 2000,
        }
      )
      await browser.close()
    } catch (err) {
      void err
    }
    try {
      unlinkSync(SESSION_FILE)
    } catch (err) {
      void err
    }
    try {
      unlinkSync(LOGS_FILE)
    } catch (err) {
      void err
    }
    cleanStaleLocks(USER_DATA_DIR)
    console.log('🛑 [Odysea Inspect] Playwright inspection browser closed.')
    return
  }

  const { context, extensionId, isNew } = await getOrCreateContext()

  const pages = context.pages()
  let page: Page = pages.find((p) => p.url().includes(extensionId)) || pages[0]
  if (!page) {
    page = await context.newPage()
    attachListeners(page)
  }

  switch (command) {
    case 'open':
    case 'goto':
    case 'navigate': {
      const targetArg = args[1] || 'index.html'
      const url = resolvePageUrl(targetArg, extensionId)
      console.log(`🌐 Navigating to: ${url}`)
      await page.goto(url, { waitUntil: 'load' })
      await page.waitForTimeout(1000)
      console.log(`✅ Loaded: "${await page.title()}"`)
      break
    }
    case 'newtab':
    case 'home': {
      const url = `chrome-extension://${extensionId}/index.html`
      await page.goto(url, { waitUntil: 'load' })
      console.log(`🌐 Opened Home page: "${await page.title()}"`)
      break
    }
    case 'popup': {
      const url = `chrome-extension://${extensionId}/popup.html`
      await page.goto(url, { waitUntil: 'load' })
      console.log(`🌐 Opened Popup: "${await page.title()}"`)
      break
    }
    case 'options':
    case 'settings': {
      const url = `chrome-extension://${extensionId}/options.html`
      await page.goto(url, { waitUntil: 'load' })
      console.log(`🌐 Opened Options: "${await page.title()}"`)
      break
    }
    case 'debug': {
      const url = `chrome-extension://${extensionId}/debug.html`
      await page.goto(url, { waitUntil: 'load' })
      console.log(`🌐 Opened Debug page: "${await page.title()}"`)
      break
    }
    case 'snapshot': {
      const title = await page.title()
      const url = page.url()
      console.log(`📄 Page: "${title}" (${url})`)
      console.log('\n--- Visible Text Content ---')
      console.log(await page.innerText('body'))
      break
    }
    case 'network': {
      const logs = loadLogs().network
      console.log(`\n📊 Network Requests Recorded (${logs.length}):`)
      if (logs.length === 0) {
        console.log('No network requests captured yet.')
      } else {
        console.table(
          logs.slice(-30).map((r) => ({
            Method: r.method,
            Type: r.resourceType,
            Status: r.status ?? 'Pending/Failed',
            Duration: r.durationMs ? `${r.durationMs}ms` : 'N/A',
            Size: r.contentLength ?? 'N/A',
            URL: r.url.length > 75 ? r.url.substring(0, 72) + '...' : r.url,
          }))
        )
      }
      break
    }
    case 'console': {
      const logs = loadLogs().console
      console.log(`\n📜 Console Logs Recorded (${logs.length}):`)
      if (logs.length === 0) {
        console.log('No console logs recorded yet.')
      } else {
        logs
          .slice(-30)
          .forEach((l) => console.log(`[${l.type.toUpperCase()}] ${l.text}`))
      }
      break
    }
    case 'eval': {
      const code = args.slice(1).join(' ')
      if (!code) {
        console.error('Please provide JavaScript code to evaluate.')
        process.exit(1)
      }
      const result = await page.evaluate(code)
      console.log('Result:', result)
      break
    }
    case 'click': {
      const selector = args[1]
      if (!selector) {
        console.error('Please provide a selector or text to click.')
        process.exit(1)
      }
      console.log(`🖱️ Clicking on "${selector}"...`)
      await page.click(selector)
      await page.waitForTimeout(500)
      console.log('✅ Click completed.')
      break
    }
    case 'fill': {
      const selector = args[1]
      const value = args[2] || ''
      if (!selector) {
        console.error('Please provide a selector and value.')
        process.exit(1)
      }
      console.log(`⌨️ Filling "${selector}" with "${value}"...`)
      await page.fill(selector, value)
      console.log('✅ Fill completed.')
      break
    }
    case 'screenshot': {
      const outPath =
        args[1] || path.resolve(process.cwd(), 'inspect-screenshot.png')
      await page.screenshot({ path: outPath, fullPage: true })
      console.log(`📸 Screenshot captured: ${outPath}`)
      break
    }
    case 'status':
    default: {
      console.log(`\n📋 [Odysea Inspect Status]`)
      console.log(`- Extension ID: ${extensionId || '(not detected yet)'}`)
      console.log(`- Active Pages: ${pages.length}`)
      pages.forEach((p, idx) => console.log(`  [${idx}] ${p.url()}`))
      console.log(`\nAvailable Commands:`)
      console.log(`  pnpm inspect open [home|popup|options|debug|<url>]`)
      console.log(`  pnpm inspect snapshot`)
      console.log(`  pnpm inspect network`)
      console.log(`  pnpm inspect console`)
      console.log(`  pnpm inspect eval "<js code>"`)
      console.log(`  pnpm inspect click "<selector>"`)
      console.log(`  pnpm inspect fill "<selector>" "<text>"`)
      console.log(`  pnpm inspect screenshot [path]`)
      console.log(`  pnpm inspect close`)
      break
    }
  }

  // If a new session was launched via open/goto/home/popup/options/debug, keep process alive so browser remains open.
  // If running a one-off command (snapshot, network, console, eval, click, fill, screenshot) connected to existing, exit immediately.
  if (!isNew) {
    process.exit(0)
  }
}

main().catch((err) => {
  console.error('Inspection error:', err)
  process.exit(1)
})
