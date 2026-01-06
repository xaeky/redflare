import { expect, test } from '@nuxt/test-utils/playwright';

test('Agent is able to create commissions, no characters', async ({ page, goto }) => {
  await goto('/api/test/claimAgentSession'); // Not available on production!
  await page.waitForURL(/\/dashboard/);
  await goto('/dashboard/commissions');
  // Invoke "New commission" action
  await page.click('button:has-text("New commission")');
  await page.waitForSelector('div:has-text("Add commission")');
  // Wait for page to load customers
  await page.waitForResponse((response) =>
    /\/api\/customers(\?.*)?$/.test(response.url()) && response.status() === 200
  );
  // Fill in commission details
  await page.getByTestId('customer-select-menu').click();
  await page.waitForTimeout(500); // Wait for options to render
  await page.getByRole('option', { name: 'Toby' }).click();
  await page.waitForTimeout(500); // Wait for selection to register and close the menu
  await page.locator('input[name="public_note"]').fill('Public E2E Test Note');
  await page.locator('input[name="secure_note"]').fill('Internal E2E Test Note');
  await page.waitForTimeout(500);
  // Save commission
  await page.getByRole('button', { name: 'Save' }).click();
  const response = await page.waitForResponse((response) =>
    response.url().includes('/api/commissions') &&
    response.request().method() === 'POST'
  );
  expect(response.status()).toBe(200);
});

test('Agent is able to edit commissions, no modifications', async ({ page, goto }) => {
  await goto('/api/test/claimAgentSession');
  await page.waitForURL(/\/dashboard/);
  await goto('/dashboard/commissions');
  // Wait for page to load commissions
  await page.waitForResponse((response) =>
    response.url().includes('/api/commissions') && response.status() === 200
  );
  // Click on first commission in the list
  await page.locator('tbody tr:first-child').locator('button').click();
  await page.waitForSelector('div:has-text("Edit commission")');
  // Wait for page to load customers
  await page.waitForResponse((response) =>
    /\/api\/customers(\?.*)?$/.test(response.url()) && response.status() === 200
  );
  // Save commission without modifications
  await page.getByRole('button', { name: 'Save' }).click();
  const response = await page.waitForResponse((response) =>
    response.url().includes('/api/commissions') &&
    response.request().method() === 'PUT'
  );
  expect(response.status()).toBe(200);
});