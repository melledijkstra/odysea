import { test, expect } from './fixtures'

test('should render the new tab page and take a screenshot', async ({ page, extensionId }, testInfo) => {
  // Mock the background image call to avoid network issues during testing
  await page.routeFromHAR('fixtures/hars/daily-image.har', {
    url: '**/api/daily-image',
    update: false,
  })

  await page.goto(`chrome-extension://${extensionId}/index.html`)

  // The title in index.html is "New Tab"
  await expect(page).toHaveTitle(/New Tab/)

  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle')

  // Take a screenshot
  const screenshotPath = testInfo.outputPath('newtab.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })
  // Attach the screenshot to the test report
  testInfo.attach('screenshot', { path: screenshotPath, contentType: 'image/png' })
})
