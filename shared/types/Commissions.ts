import * as z from 'zod';

export const commissionOptionsSchema = z.object({
  status: z.enum([
    'settled', 'missing', 'backlog', 'in_setup', 'next_up',
    'in_development', 'in_cooldown',
    'showtime', 'maintenance', 'cancelled'
  ]).optional().default('in_setup'),
  public_note: z.string().nullable().optional(),
  secure_note: z.string().nullable().optional(),
  customer: z.string(), // Customer ID
});

export const commissionUpdateSchema = z.object({
  status: z.enum([
    'settled', 'missing', 'backlog', 'in_setup', 'next_up',
    'in_development', 'in_cooldown',
    'showtime', 'maintenance', 'cancelled'
  ]).optional(),
  public_note: z.string().nullable().optional(),
  secure_note: z.string().nullable().optional(),
  customer: z.string().optional(), // Customer ID
});