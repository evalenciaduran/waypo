import { test, expect } from '@playwright/test';

test('has map title', async ({ page }) => {
  await page.goto('/');

  await page.waitForLoadState('networkidle');
  await expect(page.locator('ion-title').first()).toContainText('Mapa turístico de España', { timeout: 10000 });
});
