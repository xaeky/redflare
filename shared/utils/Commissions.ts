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
  ).default([])
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
  ).optional().default([])
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
  changelog: z.array(commissionChangelogSchema).default([]),
  base: z.string().min(1)
});

export const avatarBaseOptionsSchema = z.object({
  name: z.string().min(1),
  creator_name: z.string().min(1),
  storefront_url: z.string().url()
})