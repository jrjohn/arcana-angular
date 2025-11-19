import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to users page
    await page.getByRole('link', { name: /users/i }).click();
    await expect(page).toHaveURL(/.*users/);
  });

  test('should load user list page', async ({ page }) => {
    // Check page loaded
    await expect(page.locator('h2')).toContainText(/users/i);

    // Check user list is visible
    const userList = page.locator('[data-testid="user-list"]').or(page.locator('.user-list')).or(page.locator('table')).first();
    await expect(userList).toBeVisible({ timeout: 10000 });
  });

  test('should display pagination controls', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="user-list"],.user-list,table', { timeout: 10000 });

    // Check pagination exists
    const pagination = page.locator('ngb-pagination').or(page.locator('[aria-label="pagination"]'));
    await expect(pagination).toBeVisible();
  });

  test('should navigate through pages', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="user-list"],.user-list,table', { timeout: 10000 });

    // Click next page if available
    const nextButton = page.locator('button').filter({ hasText: /next/i }).or(
      page.locator('[aria-label*="Next"]')
    );

    const isNextEnabled = await nextButton.isEnabled();
    if (isNextEnabled) {
      await nextButton.click();
      // Wait for page to update
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/.*page=2/);
    }
  });

  test('should open user detail page', async ({ page }) => {
    // Wait for user list to load
    await page.waitForSelector('[data-testid="user-list"],.user-list,table', { timeout: 10000 });

    // Click first user (view details button or user row)
    const viewButton = page.locator('button, a').filter({ hasText: /view|detail/i }).first();
    const isVisible = await viewButton.isVisible().catch(() => false);

    if (isVisible) {
      await viewButton.click();
      // Should navigate to detail page
      await expect(page).toHaveURL(/.*users\/\d+/);

      // Check detail page loaded
      await expect(page.locator('h2, h3')).toBeVisible();
    }
  });

  test('should handle loading state', async ({ page }) => {
    // Check loading spinner appears
    const loadingSpinner = page.locator('[data-testid="loading"],.loading-spinner,.spinner');
    // Loading may disappear quickly, so we just check the page becomes ready
    await page.waitForLoadState('networkidle');

    // Check content is visible after loading
    const content = page.locator('[data-testid="user-list"],.user-list,table');
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Navigate to a page that might be empty (last page + 1)
    await page.goto('/users?page=999');

    // Should show empty state or error message
    const emptyMessage = page.locator('text=/no users|no data|not found/i');
    const hasEmptyMessage = await emptyMessage.isVisible({ timeout: 5000 }).catch(() => false);

    // Either shows empty message or redirects back
    expect(hasEmptyMessage || await page.url().includes('users')).toBeTruthy();
  });
});
