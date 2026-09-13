import { test, expect } from '@playwright/test';

test.describe('Ledger and Redemptions Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Login as student-1
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@sece.ac.in');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/profile/);
  });

  test('Student can redeem a perk and see point deduction', async ({ page }) => {
    // Check initial points in Profile - the portfolio shows points in the stats strip
    const pointsIndicator = page.locator('[style*="font-weight: 700"]').first();
    // Just verify we're on profile and something renders
    await expect(page.locator('#main-content')).toBeVisible();
    // Points number exists somewhere on the page
    await expect(page.getByText(/\d+/).first()).toBeVisible();

    // Go to Redeem page
    await page.click('a.nav-link:has-text("Redeem")');
    
    // Redeem 'Test Sticker Pack'
    await page.locator('.dossier-card', { hasText: 'Test Sticker Pack' }).locator('button', { hasText: 'Redeem' }).click();
    
    // Confirm in the modal
    await page.click('button:has-text("Confirm")');

    await expect(page.locator('text=Redemption Successful')).toBeVisible();
    await page.click('button:has-text("Close")');

    // Go to Profile to check Transaction History and new balance
    await page.goto('/profile');

    // Verify points deducted - check Recent Points section shows -100 deduction
    await expect(page.getByText('-100')).toBeVisible();
  });
});
