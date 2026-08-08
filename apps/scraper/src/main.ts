import { PlaywrightCrawler } from 'crawlee'

// This is a skeleton implementation of a Crawlee PlaywrightCrawler.
// Edit this file to configure the scraper for your specific target.

const crawler = new PlaywrightCrawler({
  // Maximum number of pages to process. Remove or increase this when running at scale.
  maxRequestsPerCrawl: 3,

  // Limits the concurrency to avoid being blocked.
  // If you need more requests per second, you can increase this cautiously.
  // minConcurrency: 1,
  maxConcurrency: 1,
  // maxRequestsPerMinute: 20,
  // Persist cookies to avoid being blocked by anti-bot mechanisms.
  persistCookiesPerSession: true,
  // Delay between requests to the same domain to avoid being blocked.
  // sameDomainDelaySecs: 5,

  // You can set this to false to see the browser when debugging.
  headless: true,

  async requestHandler({ page, request, log, enqueueLinks, pushData }) {
    // Wait for the title to be loaded
    const title = await page.title()

    log.info(`Processing ${request.loadedUrl}: ${title}`)

    // Example: Scraping basic HTML content
    // You can use standard Playwright locators to find specific elements
    // const content = await page.locator('.main-content').textContent();

    // Output the result
    // By default, PushData writes to ./storage/datasets/default/
    const result = {
      url: request.url,
      title,
    }

    log.info(`Scraped data: ${JSON.stringify(result)}`, result)

    // Store the results
    await pushData(result)

    // Extract links from the current page
    // and add them to the crawling queue
    await enqueueLinks()
  },

  // Handle failed requests
  failedRequestHandler({ request, log }) {
    log.error(`Request ${request.url} failed too many times.`)
  },
})

const startUrls = [
  'https://crawlee.dev/', // Replace with your target URLs
]

console.log('Starting the crawler...')
await crawler.run(startUrls)
console.log('Crawler finished.')
