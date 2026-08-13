import { expect, test } from '@nuxt/test-utils/playwright';
import { claimSession } from './utils/sessions';

test.describe
  .serial('Commission management with new customer', () => {
    const testState = {
      createdCustomerName: '',
      customerId: '',
      commissionId: '',
    };

    test.beforeAll(async ({ request }) => {
      await request.post('/api/test/agent/cleanupTestingCustomers');
      testState.createdCustomerName = `E2E ${Date.now()}`;
    });

    test('Agent is able to create customers', async ({ page }) => {
      test.setTimeout(1000 * 10);
      await claimSession(page, 'agent');
      const res = await page.request.post('/api/admin/customers', {
        data: {
          name: testState.createdCustomerName,
          note: 'E2E Test Customer',
        },
      });
      expect(res.ok()).toBe(true);
      const body = await res.json();
      expect(body.insertedId).toBeDefined();
      testState.customerId = body.insertedId;
    });

    test('Agent is able to create commissions with the generated customer', async ({
      page,
    }) => {
      await claimSession(page, 'agent');
      const res = await page.request.post('/api/admin/commissions', {
        data: {
          customer: testState.customerId,
          public_note: 'Public E2E Test Note',
          secure_note: 'Internal E2E Test Note',
        },
      });
      expect(res.ok()).toBe(true);
      testState.commissionId = (await res.json()).insertedId;
    });

    test('Agent should not be able to delete customers linked to commissions', async ({
      page,
    }) => {
      await claimSession(page, 'agent');
      const res = await page.request.delete(
        `/api/admin/customers/${testState.customerId}`,
      );
      expect(res.ok()).toBe(false);
    });

    test.afterAll(async ({ request }) => {
      await request.post('/api/test/agent/cleanupTestingCustomers');
    });
  });
