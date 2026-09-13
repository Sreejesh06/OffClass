import { test, expect } from '@playwright/test';

test.describe('Complaints Flow', () => {

  test('Submits an anonymous complaint and receives a tracking code', async ({ page }) => {
    test.setTimeout(60000);
    // Go to complaints page without logging in
    await page.goto('/complaints');

    // Fill out the form
    await page.selectOption('select#category', 'PLATFORM_BUG');
    await page.fill('textarea#content', 'There is a bug in the leaderboard ranking when two users have identical points.');
    
    // Submit
    await page.click('button[type="submit"]');

    // Should see success state and tracking code
    await expect(page.locator('text=Submission Received')).toBeVisible({ timeout: 15000 });
    const trackingCodeLocator = page.locator('text=Save this tracking code now').locator('..').locator('div.mono');
    await expect(trackingCodeLocator).toBeVisible();
    
    const trackingCode = (await trackingCodeLocator.innerText()).trim();
    expect(trackingCode.length).toBeGreaterThan(0);

    // Now switch to lookup tab
    await page.click('text=Check Status');

    // Search for the tracking code
    await page.fill('input[type="text"]', trackingCode);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    const textContent = await page.locator('body').innerText();
    console.log('--- PAGE TEXT ---');
    console.log(textContent);
    console.log('-----------------');

    // Verify lookup result
    await expect(page.getByText(/SUBMITTED/i)).toBeVisible();
    await expect(page.getByText(/No notes added yet/i)).toBeVisible();
  });

  test('Shows error for invalid tracking code', async ({ page }) => {
    await page.goto('/complaints');
    await page.click('text=Check Status');

    await page.fill('input[type="text"]', 'INVALID_CODE_123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    const textContent2 = await page.locator('body').innerText();
    console.log('--- PAGE TEXT 2 ---');
    console.log(textContent2);
    console.log('-----------------');

    await expect(page.getByText(/No complaint found/i)).toBeVisible();
  });
});
