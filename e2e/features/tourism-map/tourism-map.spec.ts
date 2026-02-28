import { test, expect } from '@playwright/test';

test.describe('tourism-map', () => {
  test('boots and renders map + summary list', async ({ page }) => {
    await page.goto('/tourism-map');

    await expect(page.getByTestId('google-map-canvas')).toBeVisible();
    await expect(page.getByTestId('poi-summary-list')).toBeVisible();
  });

  test('shows route summary for valid origin/destination', async ({ page }) => {
    await page.goto('/tourism-map');

    await page.getByTestId('route-origin-input').fill('40.4168,-3.7038');
    await page.getByTestId('route-destination-input').fill('41.3874,2.1686');
    await page.getByTestId('route-submit-button').click();

    await expect(page.getByTestId('route-summary-panel')).toBeVisible();
  });

  test('error path renders error state when backend fails', async ({ page }) => {
    await page.route('**/v1/pois**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'error' }) })
    );

    await page.goto('/tourism-map');
    await page.getByTestId('poi-refresh-button').click();

    await expect(page.getByTestId('poi-error-state')).toBeVisible();
  });
});
