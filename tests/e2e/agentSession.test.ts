import { expect, test } from '@nuxt/test-utils/playwright';
import { claimSession, getRedirectUrl } from './utils/sessions';

test('Claim agent session in test environment', async ({ page }) => {
  test.setTimeout(1000 * 3);
  await claimSession(page, 'agent');
  await expect(page).toHaveURL(getRedirectUrl('agent'));
});