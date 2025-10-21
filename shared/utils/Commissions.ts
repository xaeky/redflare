import * as z from 'zod';
import { CommissionStatusType } from '../enums/Commissions';

const commissionChangelogSchema = z.object({
  date: z.string().min(1, 'Change date is required'),
  items: z.array(z.string().min(1, 'Change item is required')).min(1, 'At least one change item is required')
});

export const commissionOptionsSchema = z.object({
  status: z.number().default(CommissionStatusType.InSetup),
  public_note: z.string().nullable().optional(),
  secure_note: z.string().nullable().optional(),
  customer: z.string().nonempty('Customer cannot be empty!'), // Customer ID
  created_at: z.date().or(z.string()).optional(), // Date or ISO string
  characters: z.array(
    z.object({
      name: z.string().min(1, 'Character name is required'),
      note: z.string().nullable().optional(),
      changelog: z.array(commissionChangelogSchema).default([]),
      base: z.string().min(1, 'Base character is required')
    })
  ).default([]),
  payments: z.array(z.string().min(1)).default([])
});

export const commissionUpdateSchema = z.object({
  status: z.number().optional(),
  public_note: z.string().nullable().optional(),
  secure_note: z.string().nullable().optional(),
  customer: z.string().nonempty('Customer cannot be empty!'), // Customer ID
  created_at: z.date().or(z.string()).optional(), // Date or ISO string
  characters: z.array(
    z.object({
      name: z.string().min(1, 'Character name is required'),
      note: z.string().nullable().optional(),
      changelog: z.array(commissionChangelogSchema).default([]),
      base: z.string().min(1, 'Base character is required')
    })
  ).optional().default([]),
  payments: z.array(z.string().min(1)).default([])
});
// TODO: Move me to shared/utils/Billing.ts
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
  public_note: z.string().nullable().optional(),
  secure_note: z.string().nullable().optional(),
  state: z.enum(['paid_manual', 'cancelled', 'refunded', 'chargeback', 'disputed']).optional(),
});

export const commissionCharacterOptionsSchema = z.object({
  name: z.string().min(1),
  note: z.string().nullable().optional(),
  changelog: z.array(commissionChangelogSchema).default([]),
  base: z.string().min(1)
});

export const avatarBaseOptionsSchema = z.object({
  name: z.string().min(1),
  creator_name: z.string().min(1),
  storefront_url: z.string().url()
})