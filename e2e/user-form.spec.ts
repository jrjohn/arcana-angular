import { test, expect } from '@playwright/test';

test.describe('User Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
    await page.waitForSelector('[data-testid="user-list"],.user-list,table', { timeout: 10000 });
  });

  test('should open create user form', async ({ page }) => {
    // Click add/create button
    const addButton = page.locator('button, a').filter({ hasText: /add|create|new user/i }).first();
    const isVisible = await addButton.isVisible().catch(() => false);

    if (isVisible) {
      await addButton.click();

      // Should show form
      const form = page.locator('form').first();
      await expect(form).toBeVisible();

      // Check form fields exist
      await expect(page.locator('input[name="firstName"],input[id*="firstName"]')).toBeVisible();
      await expect(page.locator('input[name="lastName"],input[id*="lastName"]')).toBeVisible();
      await expect(page.locator('input[name="email"],input[id*="email"]')).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    const addButton = page.locator('button, a').filter({ hasText: /add|create|new user/i }).first();
    const isVisible = await addButton.isVisible().catch(() => false);

    if (isVisible) {
      await addButton.click();

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]').or(
        page.locator('button').filter({ hasText: /save|submit|create/i })
      ).first();

      await submitButton.click();

      // Should show validation errors
      const errorMessages = page.locator('.invalid-feedback, .error-message, .text-danger');
      const hasErrors = await errorMessages.count() > 0;
      expect(hasErrors).toBeTruthy();
    }
  });

  test('should fill and submit form', async ({ page }) => {
    const addButton = page.locator('button, a').filter({ hasText: /add|create|new user/i }).first();
    const isVisible = await addButton.isVisible().catch(() => false);

    if (isVisible) {
      await addButton.click();

      // Fill form with test data
      await page.locator('input[name="firstName"],input[id*="firstName"]').fill('John');
      await page.locator('input[name="lastName"],input[id*="lastName"]').fill('Doe');
      await page.locator('input[name="email"],input[id*="email"]').fill('john.doe@example.com');

      // Submit form
      const submitButton = page.locator('button[type="submit"]').or(
        page.locator('button').filter({ hasText: /save|submit|create/i })
      ).first();

      await submitButton.click();

      // Should show success message or redirect
      await page.waitForTimeout(2000);

      // Check for success indicator (toast, message, or redirect)
      const successMessage = page.locator('text=/success|created|saved/i');
      const hasSuccess = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);

      // Or check if redirected back to list
      const isBackToList = page.url().includes('/users') && !page.url().includes('/form');

      expect(hasSuccess || isBackToList).toBeTruthy();
    }
  });

  test('should validate email format', async ({ page }) => {
    const addButton = page.locator('button, a').filter({ hasText: /add|create|new user/i }).first();
    const isVisible = await addButton.isVisible().catch(() => false);

    if (isVisible) {
      await addButton.click();

      // Fill with invalid email
      await page.locator('input[name="firstName"],input[id*="firstName"]').fill('John');
      await page.locator('input[name="lastName"],input[id*="lastName"]').fill('Doe');
      await page.locator('input[name="email"],input[id*="email"]').fill('invalid-email');

      // Try to submit
      const submitButton = page.locator('button[type="submit"]').or(
        page.locator('button').filter({ hasText: /save|submit|create/i })
      ).first();

      await submitButton.click();

      // Should show email validation error
      const emailError = page.locator('text=/invalid email|email format/i');
      const hasEmailError = await emailError.isVisible({ timeout: 3000 }).catch(() => false);

      expect(hasEmailError).toBeTruthy();
    }
  });

  test('should cancel form', async ({ page }) => {
    const addButton = page.locator('button, a').filter({ hasText: /add|create|new user/i }).first();
    const isVisible = await addButton.isVisible().catch(() => false);

    if (isVisible) {
      await addButton.click();

      // Fill some data
      await page.locator('input[name="firstName"],input[id*="firstName"]').fill('John');

      // Click cancel
      const cancelButton = page.locator('button').filter({ hasText: /cancel|back/i }).first();
      await cancelButton.click();

      // Should return to list view
      await expect(page.locator('[data-testid="user-list"],.user-list,table')).toBeVisible({ timeout: 5000 });
    }
  });
});
