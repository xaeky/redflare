import { test } from '@nuxt/test-utils/playwright';
import { claimSession } from './utils/sessions';

test('Claim public session in test environment', async ({ page }) => {
  test.setTimeout(1000 * 10);
  await claimSession(page, 'public');
});