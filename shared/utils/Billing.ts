import { z } from 'zod';

export const commissionPaymentOptionsSchema = z.object({
  total_paid_amount: z.number().min(0, 'Total paid amount must be non-negative'),
  net_received_amount: z.number().min(0, 'Net received amount must be non-negative'),
  payment_processor: z.enum(['mercadopago', 'paypal']),
  payment_currency: z.enum(['ARS', 'USD']), // ISO 4217 currency code
  payment_ext_id: z.string().min(1, 'External payment ID is required'),
  payment_ext_url: z.string().url('External payment URL must be a valid URL').optional().or(z.literal('')),
  approved_at: z.string().min(1, 'Approval date is required'),
  internal_note: z.string().nullable().optional()
});

export const commissionPaymentUpdateSchema = z.object({
  internal_note: z.string().nullable().optional()
});