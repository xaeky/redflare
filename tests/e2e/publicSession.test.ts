import { expect, test } from '@nuxt/test-utils/playwright';

test('Claim public session in test environment', async ({ page, goto }) => {
  await goto('/api/test/claimPublicSession');
  await expect(page).toHaveURL(/\/me/);
});