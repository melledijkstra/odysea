import { test, expect } from './fixtures'

test('should render the new tab page and cache the daily image', async ({ page, extensionId }, testInfo) => {
  // Mock the background image call to avoid network issues during testing
  await page.routeFromHAR('fixtures/hars/daily-image.har', {
    url: '**/api/daily-image',
    update: false,
  })

  let dailyImageRequests = 0
  page.on('request', (req) => {
    if (req.url().includes('/api/daily-image')) {
      dailyImageRequests++
    }
  })

  await page.goto(`chrome-extension://${extensionId}/index.html`)
  await page.waitForLoadState('load')
  await page.waitForTimeout(2000) // Wait for background fetches to finish

  // The title in index.html is "New Tab"
  await expect(page).toHaveTitle(/New Tab/)
  await expect(page.getByTestId('background-image')).toHaveCSS('background-image', /url\(["']?.*["']?\)/)

  // Verify that daily image was fetched on initial load
  expect(dailyImageRequests).toBeGreaterThanOrEqual(1)

  // Reset counter
  dailyImageRequests = 0

  // Reload the page
  console.log('Reloading page to test cache retention...')
  await page.reload()
  await page.waitForLoadState('load')
  await page.waitForTimeout(2000)

  // Verify that reloading the page did NOT fetch the daily image again
  expect(dailyImageRequests).toBe(0)
  await expect(page.getByTestId('background-image')).toHaveCSS('background-image', /url\(["']?.*["']?\)/)

  // Take a screenshot
  const screenshotPath = testInfo.outputPath('newtab.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })
  // Attach the screenshot to the test report
  testInfo.attach('screenshot', { path: screenshotPath, contentType: 'image/png' })
})
