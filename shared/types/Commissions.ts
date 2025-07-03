import * as z from 'zod';

export const commissionOptionsSchema = z.object({
  status: z.enum([
    'settled', 'missing', 'backlog', 'in_setup', 'next_up',
    'in_development', 'in_cooldown',
    'showtime', 'maintenance', 'cancelled'
  ]).optional().default('in_setup'),
  public_note: z.string().nullable().optional(),
  secure_note: z.string().nullable().optional(),
  customer: z.string().nonempty('Customer cannot be empty!'), // Customer ID
  created_at: z.date().or(z.string()).optional(), // Date or ISO string
});

export const commissionUpdateSchema = z.object({
  status: z.enum([
    'settled', 'missing', 'backlog', 'in_setup', 'next_up',
    'in_development', 'in_cooldown',
    'showtime', 'maintenance', 'cancelled'
  ]).optional(),
  public_note: z.string().nullable().optional(),
  secure_note: z.string().nullable().optional(),
  customer: z.string().nonempty('Customer cannot be empty!'), // Customer ID
  created_at: z.date().or(z.string()).optional(), // Date or ISO string
});

export const commissionPaymentOptionsSchema = z.object({
  currency: z.enum(['ARS', 'USD']), // ISO 4217 currency code
  income_amount: z.number().positive(),
  public_note: z.string().nullable().optional(),
  secure_note: z.string().nullable().optional()
});

export const commissionPaymentUpdateSchema = z.object({
  public_note: z.string().nullable().optional(),
  secure_note: z.string().nullable().optional(),
  state: z.enum(['paid_manual', 'cancelled', 'refunded', 'chargeback', 'disputed']).optional(),
});

export const commissionCharacterOptionsSchema = z.object({
  name: z.string().min(1),
  note: z.string().nullable().optional(),
  changelog: z.record(z.string()).nullable().optional(),
  base: z.string().min(1)
});

export const commissionBaseOptionsSchema = z.object({
  name: z.string().min(1),
  creator_name: z.string().min(1),
  storefront_url: z.string().url()
})