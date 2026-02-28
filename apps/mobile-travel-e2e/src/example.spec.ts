import { test, expect } from '@playwright/test';

test('has explore map view elements', async ({ page }) => {
  await page.goto('/');

  await page.waitForLoadState('networkidle');
  await expect(page.locator('app-tourism-map-toolbar')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('input[placeholder="City/POI"]')).toBeVisible();
  await expect(page.getByTestId('poi-summary-list')).toBeVisible();
  await expect(page.locator('app-tourism-bottom-nav')).toBeVisible();
});

test('opens route planner from the bottom area', async ({ page }) => {
  await page.goto('/');

  await page.waitForLoadState('networkidle');

  // Click the open planner fab
  await page.click('button.tp-map-page__fab-main');

  // Verify the planner opened
  await expect(page.locator('app-tourism-route-planner')).toBeVisible({ timeout: 10000 });

  // Verify inputs and mode toggles exist
  await expect(page.locator('input[placeholder="Origin"]')).toBeVisible();
  await expect(page.locator('input[placeholder="Where to?"]')).toBeVisible();

  // Test mode switch
  await page.getByText('Walk', { exact: true }).click();
  const walkRadio = page.locator('input[value="walking"]');
  await expect(walkRadio).toBeChecked();
});

test('handles offline error state rendering gracefully', async ({ page }) => {
  // Use Playwright route interception to mock a failed server response
  await page.route('**/api/**', route => route.abort('failed'));

  await page.goto('/');

  // Should show the offline banner or empty state
  await expect(page.locator('app-tourism-empty-state, app-tourism-offline-banner')).toBeVisible({ timeout: 10000 });
});
