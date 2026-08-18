import { Dataset, PlaywrightCrawler, RequestQueue } from 'crawlee'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import TurndownService from 'turndown'
import { slugify } from '../utils.js'

interface ScrapedArticle {
  pillar: string
  section: string
  title: string
  slug: string
  readTime: string
  sourceUrl: string
  pillarIndex: number
  sectionIndex: number
  topicIndex: number
  filePath: string
  html: string
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  hr: '---',
})

// Add GFM Table conversion rule to Turndown
turndown.addRule('table', {
  filter: 'table',
  replacement: (_content, node) => {
    const tableEl = node as HTMLTableElement
    const rows = Array.from(tableEl.querySelectorAll('tr'))
    if (!rows.length) return ''

    let markdown = '\n\n'
    const headerRow = rows[0]
    const headerCells = Array.from(headerRow.querySelectorAll('th, td')).map(
      (c) => c.textContent?.trim().replace(/\|/g, '\\|') ?? ''
    )

    if (headerCells.length > 0) {
      markdown += `| ${headerCells.join(' | ')} |\n`
      markdown += `| ${headerCells.map(() => '---').join(' | ')} |\n`
    }

    const bodyRows = rows.slice(1)
    for (const row of bodyRows) {
      const cells = Array.from(row.querySelectorAll('th, td')).map(
        (c) => c.textContent?.trim().replace(/\|/g, '\\|') ?? ''
      )
      if (cells.length) {
        markdown += `| ${cells.join(' | ')} |\n`
      }
    }
    return `${markdown}\n`
  },
})

// Open domain-specific Crawlee storage
const queue = await RequestQueue.open('ss-fitness-queue')
await queue.drop()
const freshQueue = await RequestQueue.open('ss-fitness-queue')

const dataset = await Dataset.open<ScrapedArticle>('ss-fitness-dataset')

await freshQueue.addRequest({
  url: 'https://ss.fitness/',
  uniqueKey: 'https://ss.fitness/',
})

const crawler = new PlaywrightCrawler({
  requestQueue: freshQueue,
  maxRequestsPerCrawl: 1,
  headless: true,

  async requestHandler({ page, request, log }) {
    log.info(`Scraping and processing: ${request.url}`)

    await page.waitForLoadState('networkidle')

    const rawArticles = await page.evaluate(() => {
      const result: Array<{
        pillar: string
        section: string
        title: string
        id: string
        readTime: string
        pillarIndex: number
        sectionIndex: number
        topicIndex: number
        html: string
      }> = []

      const pillarOrder = ['BODY', 'DIET', 'EXERCISE']
      const dynamicSections = Array.from(
        document.querySelectorAll('section.dynamic-load')
      )

      let currentPillar = ''
      let currentSection = ''
      let pIdx = 0
      let sIdx = 0
      let tIdx = 0

      for (const sec of dynamicSections) {
        const breadcrumbItems = Array.from(
          sec.querySelectorAll('.breadcrumb li')
        ).map((li) => (li as HTMLElement).innerText.trim())
        const rawTime =
          (
            sec.querySelector('.breadcrumb .time') as HTMLElement
          )?.innerText?.trim() ?? ''
        const h2 = sec.querySelector('h2')
        const title =
          h2?.innerText?.replace(/Copy Link/g, '').trim() ?? 'Untitled'
        const id = h2?.id || sec.id || ''

        const pillar =
          breadcrumbItems[0] ||
          (pillarOrder.find((p) => sec.className.toUpperCase().includes(p)) ??
            'GENERAL')
        const section = breadcrumbItems[1] || 'General'

        if (pillar !== currentPillar) {
          currentPillar = pillar
          pIdx++
          sIdx = 0
          tIdx = 0
        }

        if (section !== currentSection) {
          currentSection = section
          sIdx++
          tIdx = 0
        }

        tIdx++

        // Clone DOM element to clean up non-content UI elements
        const clone = sec.cloneNode(true) as HTMLElement
        clone.querySelector('.breadcrumb')?.remove()
        clone
          .querySelectorAll(
            '.in-this-section, .contents, .copy-link, .breadcrumb, nav, footer, .prev-next, .navigation'
          )
          .forEach((el) => el.remove())

        // Remove bottom navigation bar
        clone.querySelectorAll('p, div, ul').forEach((el) => {
          const text = (el as HTMLElement).innerText ?? ''
          if (text.includes('Body Image') && text.includes('Health Factors')) {
            el.remove()
          }
        })

        // Fix image paths to absolute
        clone.querySelectorAll('img').forEach((img) => {
          const src = img.getAttribute('src')
          if (src && !src.startsWith('http')) {
            img.setAttribute('src', new URL(src, 'https://ss.fitness/').href)
          }
        })

        // Fix internal relative anchor links
        clone.querySelectorAll('a').forEach((a) => {
          const href = a.getAttribute('href')
          if (href && href.startsWith('/')) {
            a.setAttribute('href', new URL(href, 'https://ss.fitness/').href)
          }
        })

        result.push({
          pillar,
          section,
          title,
          id,
          readTime: rawTime,
          pillarIndex: pIdx,
          sectionIndex: sIdx,
          topicIndex: tIdx,
          html: clone.innerHTML,
        })
      }

      return result
    })

    log.info(`Found ${rawArticles.length} articles across all categories.`)

    const outputBaseDir = path.resolve(process.cwd(), 'output/ss-fitness')
    await fs.mkdir(outputBaseDir, { recursive: true })

    for (const item of rawArticles) {
      const slug = slugify(item.title.replace(/M³ Model/g, '').trim())
      const sourceUrl = `https://ss.fitness/#${item.id}`

      const pillarDirName = `${String(item.pillarIndex).padStart(2, '0')}-${slugify(item.pillar)}`
      const sectionDirName = `${String(item.sectionIndex).padStart(2, '0')}-${slugify(item.section)}`
      const targetDir = path.join(outputBaseDir, pillarDirName, sectionDirName)
      await fs.mkdir(targetDir, { recursive: true })

      const fileName = `${String(item.topicIndex).padStart(2, '0')}-${slug}.md`
      const targetFile = path.join(targetDir, fileName)
      const relFilePath = path.relative(process.cwd(), targetFile)

      const record: ScrapedArticle = {
        pillar: item.pillar,
        section: item.section,
        title: item.title,
        slug,
        readTime: item.readTime,
        sourceUrl,
        pillarIndex: item.pillarIndex,
        sectionIndex: item.sectionIndex,
        topicIndex: item.topicIndex,
        filePath: relFilePath,
        html: item.html,
      }

      // 1. Store structured dataset in Crawlee
      await dataset.pushData(record)

      // 2. Convert to Notion-compatible Markdown
      const markdownBody = turndown.turndown(item.html)

      const frontmatter = [
        '---',
        `title: ${JSON.stringify(item.title)}`,
        `pillar: ${JSON.stringify(item.pillar)}`,
        `section: ${JSON.stringify(item.section)}`,
        `read_time: ${JSON.stringify(item.readTime)}`,
        `source_url: ${JSON.stringify(sourceUrl)}`,
        '---',
        '',
      ].join('\n')

      const fullMarkdown = `${frontmatter}\n${markdownBody}\n`

      // 3. Write structured markdown file
      await fs.writeFile(targetFile, fullMarkdown, 'utf-8')
      log.info(`Saved: ${relFilePath}`)
    }
  },

  failedRequestHandler({ request, log }) {
    log.error(`Request to ${request.url} failed.`)
  },
})

console.log('Starting ss.fitness scraper...')
await crawler.run()
console.log('ss.fitness scraper finished successfully.')
