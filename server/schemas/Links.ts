import { z } from 'zod';

export const createPaymentLinkOptionsSchema = z.object({
  commission_id: z.string(),
  customer_id: z.string(),
  attachment: z.object({
    currency: z.enum(['ARS', 'USD']),
    amount: z.number()
  }),
  note: z.string().max(256).optional()
});
