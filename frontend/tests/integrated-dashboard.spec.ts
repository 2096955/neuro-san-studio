/**
 * Integrated Dashboard (Neuro + RAI) – Playwright tests
 * Verifies page loads, network selector and RAI section exist.
 * Real LLM calls occur when user sends a message via /api/chat (no mocks).
 */
import { test, expect } from '@playwright/test';

test.describe('Integrated Dashboard', () => {
  test('should load integrated dashboard page', async ({ page }) => {
    await page.goto('/integrated-dashboard');
    await page.waitForLoadState('domcontentloaded');

    const heading = page.locator('text=Integrated Dashboard').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should show Neuro section with network selector', async ({ page }) => {
    await page.goto('/integrated-dashboard');
    await page.waitForLoadState('networkidle');

    const networkSelect = page.locator(
      '#integrated-network-select, select[aria-label*="network"], select'
    ).first();
    await expect(networkSelect).toBeVisible({ timeout: 10000 });
  });

  test('should show RAI metrics section', async ({ page }) => {
    await page.goto('/integrated-dashboard');
    await page.waitForLoadState('networkidle');

    const raiHeading = page.locator('text=Responsible AI metrics').first();
    await expect(raiHeading).toBeVisible({ timeout: 10000 });
  });

  test('should link to full RAI Dashboard', async ({ page }) => {
    await page.goto('/integrated-dashboard');
    await page.waitForLoadState('networkidle');

    const raiLink = page.locator('a[href*="/rai"]').filter({ hasText: 'Open full RAI Dashboard' });
    await expect(raiLink).toBeVisible({ timeout: 5000 });
    await expect(raiLink).toHaveAttribute('href', /\/rai/);
  });
});
