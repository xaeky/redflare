import { expect, test } from '@nuxt/test-utils/playwright';
import { claimSession } from './utils/sessions';

test('Anon user is able to see any commission', async ({ page, request }) => {
  test.setTimeout(1000 * 10);
  const randomCommissionResponse = await request.get(
    '/api/test/public/commissions/findAnyOne',
  );
  const randomCommissionId = (await randomCommissionResponse.json())._id;
  const res = await page.request.get(
    `/api/public/commissions/${randomCommissionId}`,
  );
  expect(res.ok()).toBe(true);
  const rawData = await res.json();
  expect(rawData.data).toBeDefined();
});

test('Public user is able to fetch their own commissions', async ({ page }) => {
  test.setTimeout(1000 * 10);
  await claimSession(page, 'public');
  const res = await page.request.get('/api/public/me/commissions');
  expect(res.ok()).toBe(true);
  const rawData = await res.json();
  expect(rawData.data).toBeDefined();
  expect(Array.isArray(rawData.data)).toBe(true);
});
