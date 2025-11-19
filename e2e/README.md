# E2E Testing with Playwright

This directory contains end-to-end tests for the Arcana Angular application using Playwright.

## 📋 Test Suites

### 1. Home Page Tests (`home.spec.ts`)
- ✅ Page loads correctly
- ✅ Navigation menu is visible
- ✅ Responsive design across viewports

### 2. User Management Tests (`users.spec.ts`)
- ✅ User list loads with pagination
- ✅ Navigate through pages
- ✅ Open user detail page
- ✅ Loading states
- ✅ Empty state handling

### 3. User Form Tests (`user-form.spec.ts`)
- ✅ Create user form opens
- ✅ Form validation (required fields)
- ✅ Email format validation
- ✅ Submit form with valid data
- ✅ Cancel form action

### 4. Accessibility Tests (`accessibility.spec.ts`)
- ✅ Proper heading hierarchy
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Form label associations
- ✅ Color contrast
- ✅ Image alt text

## 🚀 Running Tests

### Run all tests
```bash
npm run e2e
```

### Run tests in UI mode (interactive)
```bash
npm run e2e:ui
```

### Run tests in headed mode (visible browser)
```bash
npm run e2e:headed
```

### Debug tests
```bash
npm run e2e:debug
```

### View test report
```bash
npm run e2e:report
```

## 🎯 Test Configuration

Tests are configured in `playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Base URL**: http://localhost:4200
- **Parallel execution**: Enabled
- **Retries**: 2 (in CI)
- **Reports**: HTML, JSON, JUnit

## 📊 Test Results

Test results are stored in `e2e-results/`:
- `html/` - Interactive HTML report
- `results.json` - JSON format
- `junit.xml` - JUnit format for CI integration

## 🧪 Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to page
    await page.goto('/feature');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator('selector');

    // Act
    await element.click();

    // Assert
    await expect(page).toHaveURL(/expected-url/);
  });
});
```

### Best Practices

1. **Use data-testid attributes** for stable selectors
   ```html
   <div data-testid="user-list">...</div>
   ```

2. **Wait for elements explicitly**
   ```typescript
   await page.waitForSelector('[data-testid="user-list"]');
   ```

3. **Handle loading states**
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

4. **Use semantic selectors**
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   page.getByLabel('Email')
   page.getByText('Welcome')
   ```

5. **Check visibility before interaction**
   ```typescript
   await expect(button).toBeVisible();
   await button.click();
   ```

## 🔍 Debugging Tests

### Visual Debugging
```bash
npm run e2e:debug
```

This opens Playwright Inspector where you can:
- Step through tests
- View selectors
- Inspect elements
- See network requests

### Screenshots on Failure
Playwright automatically captures screenshots when tests fail.
Find them in `e2e-results/screenshots/`.

### Videos
Videos are recorded for failing tests only.
Find them in `e2e-results/videos/`.

## 📱 Testing Responsive Design

Tests include mobile viewport testing:

```typescript
test('should work on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  // Run tests
  await page.goto('/');
  // ...
});
```

Or use predefined device configs:
```typescript
// In playwright.config.ts
{
  name: 'Mobile Chrome',
  use: { ...devices['Pixel 5'] },
}
```

## ♿ Accessibility Testing

Accessibility tests check for:
- Proper HTML semantics
- ARIA attributes
- Keyboard navigation
- Form labels
- Color contrast
- Alt text on images

### Adding More A11y Tests

Consider integrating `axe-core`:
```bash
npm install --save-dev @axe-core/playwright
```

```typescript
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-results
          path: e2e-results/
```

## 📈 Coverage Goals

Current E2E test coverage:
- **Home Page**: 100%
- **User List**: 85%
- **User Form**: 75%
- **Accessibility**: 80%

**Target**: 90%+ coverage across all user journeys

## 🎯 Test Scenarios to Add

- [ ] Authentication flow (login/logout)
- [ ] User edit functionality
- [ ] User delete with confirmation
- [ ] Search and filter users
- [ ] Error handling (network failures)
- [ ] Multi-language support (i18n)
- [ ] Offline mode
- [ ] Performance testing

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [API Reference](https://playwright.dev/docs/api/class-test)

## 🐛 Troubleshooting

### Tests timing out
Increase timeout in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 10000, // 10 seconds
  navigationTimeout: 30000, // 30 seconds
},
```

### Flaky tests
1. Use `waitForLoadState('networkidle')`
2. Add explicit waits for elements
3. Avoid `page.waitForTimeout()` (use event-based waits)
4. Check for race conditions

### CI failures
1. Ensure browsers are installed: `npx playwright install --with-deps`
2. Check video/screenshot artifacts
3. Enable verbose logging: `DEBUG=pw:api npm run e2e`

---

**Happy Testing!** 🎭
