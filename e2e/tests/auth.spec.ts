import { test, expect } from '@playwright/test';

test.describe('Authentication and RBAC Routing', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any potential existing session
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('Student login succeeds and routes to Profile but denies Admin Dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'student@sece.ac.in');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should route to /profile
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.locator('h1')).toBeVisible();

    // Attempt to navigate to Admin Dashboard directly
    await page.goto('/admin');
    
    // Should be redirected back or see "Not Found" / forbidden
    // Assuming our ProtectedRoute intercepts and redirects to /profile
    await expect(page).toHaveURL(/\/profile/);
  });

  test('Teacher login succeeds and allows access to Admin Dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'teacher@sece.ac.in');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Assuming teacher also goes to /profile first, or wherever dashboard is
    await expect(page).toHaveURL(/\/profile/);

    // Click Admin in nav
    await page.click('text="Admin"');
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('h1')).toContainText('Department Tools');
  });

  test('Invalid credentials show error message', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'student@sece.ac.in');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    const errorMsg = page.locator('text=Invalid credentials');
    await expect(errorMsg).toBeVisible();
  });
});
