import { z } from 'zod';

export const getPaymentSchema = z.object({
  id: z.string()
});
