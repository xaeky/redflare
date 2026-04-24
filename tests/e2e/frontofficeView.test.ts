import { expect, test } from '@nuxt/test-utils/playwright';

test('Anon user is able to see commission details', async ({ page, goto }) => {
  await goto(`/commission/${process.env.TEST_PUBLIC_COMMISSIONID}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Commission' })).toBeVisible();
});

test('Public user is able to fetch their own commissions', async ({ page, goto }) => {
  await goto('/api/test/claimPublicSession');
  await page.waitForURL('/me');
  page.on('response', async (response) => {
    if (response.url().includes('/api/commissions') && response.status() === 200) {
      const rawData = await response.json();
      expect(rawData.data).toBeDefined();
      expect(Array.isArray(rawData.data)).toBe(true);
    }
  });
});

test('Public user is able to fetch own commission', async ({ page, goto }) => {
  await goto('/api/test/claimPublicSession');
  await page.waitForURL('/me');
  await goto(`/commission/${process.env.TEST_PUBLIC_COMMISSIONID}`);
  await expect(page.getByRole('heading', { name: 'Commission' })).toBeVisible();
});