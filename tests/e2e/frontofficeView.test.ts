import { expect, test } from '@nuxt/test-utils/playwright';
import _ from 'lodash';

test('Anon user is able to see commission details', async ({ page, goto }) => {
  await goto(`/commission/${process.env.TEST_PUBLIC_COMMISSIONID}`);
  await expect(page.getByRole('heading', { name: 'Commission' })).toBeVisible();
});

test('Public user is able to fetch commissions', async ({ page, goto }) => {
  await goto('/api/test/claimPublicSession');
  await page.waitForURL('/me');
  page.on('response', async (response) => {
    if (response.url().includes('/api/commissions') && response.status() === 200) {
      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    }
  });
});

test('Public user is able to fetch own commission', async ({ page, goto }) => {
  await goto('/api/test/claimPublicSession');
  await page.waitForURL('/me');
  await goto(`/commission/${process.env.TEST_PUBLIC_COMMISSIONID}`);
  await expect(page.getByRole('heading', { name: 'Commission' })).toBeVisible();
});