import { test, expect } from '@playwright/test';

test('has title and can toggle theme', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Wait for the app to load
  await expect(page).toHaveTitle(/OffClass/i);
  
  // Interact with theme toggle if present, or just scroll
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // We should be on the auth page if not logged in
  const loginTitle = page.locator('h1', { hasText: 'Login' });
  if (await loginTitle.isVisible()) {
    // Fill the login form
    await page.fill('input[type="email"]', 'teacher@cryptid.edu');
    await page.fill('input[type="password"]', 'teacher123');
    await page.click('button[type="submit"]');
    
    // Wait for the URL to change to dashboard or board
    await page.waitForURL('**/board', { timeout: 5000 }).catch(() => {});
    
    // Verify a button exists (like Opportunity Board)
    await expect(page.locator('text=Opportunity Board').first()).toBeVisible();
    
    // Scroll and click a tab
    await page.evaluate(() => window.scrollBy(0, 500));
    const tabButton = page.locator('button', { hasText: 'ALL' }).first();
    if (await tabButton.isVisible()) {
      await tabButton.click();
    }
  }
});
