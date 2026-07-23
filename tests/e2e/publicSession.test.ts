import { expect, test } from '@nuxt/test-utils/playwright';
import { claimSession, getRedirectUrl } from './utils/sessions';

test('Claim public session in test environment', async ({ page }) => {
  test.setTimeout(1000 * 3);
  await claimSession(page, 'public');
  await expect(page).toHaveURL(getRedirectUrl('public'));
});