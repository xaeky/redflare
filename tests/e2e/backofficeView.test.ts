import { expect, test } from '@nuxt/test-utils/playwright';
import { claimSession } from './utils/sessions';

test.describe.serial('Commission management with new customer', () => {
  let testState = {
    createdCustomerName: ''
  };
  
  test.beforeAll(async ({ request }) => {
    await request.post('/api/test/cleanupTestingCustomers');
    testState.createdCustomerName = `E2E ${Date.now()}`;
  });

  test('Agent is able to create customers', async ({ page, goto }) => {
    await claimSession(page, 'agent');
    await goto('/dashboard/customers');
    await page.waitForLoadState('networkidle');
    // Invoke "Add customer" action
    await page.waitForSelector('div:has-text("Add customer")');
    await page.click('button:has-text("Add customer")');
    await page.waitForTimeout(500); // Wait for slideover animation
    // Fill in customer details
    await page.locator('input[name="name"]').fill(testState.createdCustomerName);
    await page.locator('input[name="note"]').fill('E2E Test Customer');
    await page.waitForTimeout(500);
    await page.getByTestId('add-customer-submit').click();
    const response = await page.waitForResponse((response) =>
      response.url().includes('/api/customers') &&
      response.request().method() === 'POST'
    );
    expect(response.status()).toBe(200);
  });

  test('Agent is able to create commissions with the generated customer', async ({ page, goto }) => {
    await claimSession(page, 'agent');
    await goto('/dashboard/commissions');
    await page.waitForLoadState('networkidle');
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
    await page.getByRole('combobox', { name: 'Search...' }).fill(testState.createdCustomerName);
    // Ensure the debounce and filtering have completed by waiting for the expected option to appear
    await page.waitForResponse((response) =>
      new RegExp(`/api/customers\\?name=E2E`).test(response.url()) && response.status() === 200
    );
    await page.waitForTimeout(500); // Wait for selection to register and close the menu
    // Click on the filtered customer option
    await page.getByRole('option', { name: testState.createdCustomerName }).click();
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

  test('Agent should not be able to delete customers that are linked to commissions', async ({ page, goto }) => {
    await claimSession(page, 'agent');
    await goto('/dashboard/customers');
    await page.waitForLoadState('networkidle');
    const trRow = page.locator(`tr:has-text("${testState.createdCustomerName}")`);
    await trRow.locator('button').click();
    // Wait for slideover to open
    await page.waitForSelector('h2:has-text("Edit customer")');
    await page.getByTestId('delete-customer-submit').click();
    // Wait for confirmation dialog and confirm deletion
    await page.waitForSelector('h2:has-text("Delete Customer")');
    (await page.waitForSelector('button:has-text("Delete")')).click();
    const response = await page.waitForResponse((response) =>
      response.url().includes('/api/customers/') &&
      response.request().method() === 'DELETE'
    );
    expect(response.status()).toBe(400);
  });

  test.afterAll(async ({ request }) => {
    await request.post('/api/test/cleanupTestingCustomers');
  });
});