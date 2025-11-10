import * as z from 'zod';
import { CommissionStatusType } from '../enums/Commissions';

export const commissionChangelogSchema = z.object({
  date: z.date().or(z.string()),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[0-9A-Za-z-.]+)?(\+[0-9A-Za-z-.]+)?$/, 'Version must be in SemVer format'),
  items: z.array(z.string().min(1, 'Change item is required')).min(1, 'At least one change item is required'),
  file_id: z.string().nullable().optional()
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