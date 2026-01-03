import { expect, test } from '@nuxt/test-utils/playwright';

test('Agent is able to authenticate', async ({ page, goto }) => {
  await goto('/api/auth/auth0');
  await page.waitForURL(/auth0.com/);
  await page.fill('input[name="username"]', process.env.TEST_AGENT_OAUTH_USER || '');
  await page.fill('input[name="password"]', process.env.TEST_AGENT_OAUTH_PASS || '');
  await page.click('button[name="action"]');
  await expect(page).toHaveURL(/\/dashboard/);
});

test('Claim agent session in test environment', async ({ page, goto }) => {
  await goto('/api/test/claimAgentSession');
  await expect(page).toHaveURL(/\/dashboard/);
});