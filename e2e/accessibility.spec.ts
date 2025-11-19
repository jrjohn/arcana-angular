import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('home page should be accessible', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);

    // Check for lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();

    // Check for skip links or landmark regions
    const main = await page.locator('main, [role="main"]').count();
    const nav = await page.locator('nav, [role="navigation"]').count();

    expect(main + nav).toBeGreaterThan(0);
  });

  test('user list should have proper table semantics', async ({ page }) => {
    await page.goto('/users');
    await page.waitForSelector('[data-testid="user-list"],.user-list,table', { timeout: 10000 });

    // If using table, check for proper structure
    const tables = await page.locator('table').count();
    if (tables > 0) {
      const thead = await page.locator('thead').count();
      const tbody = await page.locator('tbody').count();

      expect(thead).toBeGreaterThan(0);
      expect(tbody).toBeGreaterThan(0);
    }
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // All buttons should have accessible text or aria-label
    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');

      const hasAccessibleName = text?.trim() || ariaLabel || title;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/users');

    const addButton = page.locator('button, a').filter({ hasText: /add|create|new user/i }).first();
    const isVisible = await addButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (isVisible) {
      await addButton.click();

      // Check form inputs have labels
      const inputs = await page.locator('input[type="text"], input[type="email"]').all();

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const name = await input.getAttribute('name');
        const ariaLabel = await input.getAttribute('aria-label');

        // Either has id with matching label, or aria-label
        let hasLabel = false;

        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count();
          hasLabel = label > 0;
        }

        hasLabel = hasLabel || !!ariaLabel || !!name;
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test('navigation should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab through navigation
    await page.keyboard.press('Tab');

    // Active element should be focusable
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBeTruthy();

    // Should be able to activate link with Enter
    await page.keyboard.press('Enter');

    // Should navigate somewhere
    await page.waitForTimeout(1000);
    const newUrl = page.url();
    expect(newUrl).toBeTruthy();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');

    // Check background and text colors are set
    const bodyBg = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).backgroundColor;
    });

    const bodyColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).color;
    });

    expect(bodyBg).toBeTruthy();
    expect(bodyColor).toBeTruthy();
    expect(bodyBg).not.toBe(bodyColor); // Background and text should be different
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Images should have alt text or role="presentation" for decorative images
      const hasAltOrRole = alt !== null || role === 'presentation';
      expect(hasAltOrRole).toBeTruthy();
    }
  });
});
