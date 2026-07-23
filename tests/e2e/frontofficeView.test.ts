import { expect, test } from '@nuxt/test-utils/playwright';
import { claimSession } from './utils/sessions';

test('Anon user is able to see any commission', async ({ page, goto, request }) => {
  test.setTimeout(1000 * 10);
  const randomCommission = await request.get('/api/test/public/commissions/findAnyOne');
  const randomCommissionId = (await randomCommission.json())._id;
  await goto(`/commission/${randomCommissionId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Commission' })).toBeVisible();
});

test('Public user is able to fetch their own commissions', async ({ page }) => {
  test.setTimeout(1000 * 10);
  await claimSession(page, 'public');
  page.on('response', async (response) => {
    if (response.url().includes('/api/commissions') && response.status() === 200) {
      const rawData = await response.json();
      expect(rawData.data).toBeDefined();
      expect(Array.isArray(rawData.data)).toBe(true);
    }
  });
});

test('Public user is able to fetch their own commission', async ({ page, goto }) => {
  test.setTimeout(1000 * 10);
  await claimSession(page, 'public'); // On browser context
  const randomOwnCommission = await page.request.get('/api/test/public/me/commissions/findAnyOne'); // On server(?) context
  const randomOwnCommissionId = (await randomOwnCommission.json())._id;
  await goto(`/commission/${randomOwnCommissionId}`);
  await expect(page.getByRole('heading', { name: 'Commission' })).toBeVisible();
});