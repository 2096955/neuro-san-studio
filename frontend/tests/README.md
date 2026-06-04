# Playwright Tests

## Overview
End-to-end tests for the NeuroSAN frontend application using Playwright.

## Test Results

✅ **All 7 tests passing**

### Test Coverage

1. **Application Loading**
   - ✅ Application loads successfully
   - ✅ Main layout displays correctly
   - ✅ Page title is set

2. **Navigation**
   - ✅ RAI dashboard navigation works
   - ✅ Sidebar navigation is present

3. **Theme & Styling**
   - ✅ NeuroSAN theme colors are applied
   - ✅ No critical console errors

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### View HTML report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Test Structure

Tests are located in `tests/app.spec.ts` and cover:
- Basic application loading
- Layout and navigation
- Theme application
- Error handling

## Configuration

Playwright configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:5173`
- Browser: Chromium
- Auto-starts dev server before tests
- Screenshots on failure
- Trace collection on retry

## Adding New Tests

Create new test files in the `tests/` directory following the pattern:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    // Your test code
  });
});
```









