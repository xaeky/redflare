import * as z from 'zod';

// Every value from the `Permission` union in shared/types/Permissions.d.ts.
// Native agent accounts currently all receive every permission (no granular
// roles/profiles yet) — keep this list in sync with that union.
export const ALL_PERMISSIONS: Permission[] = [
  'read:commissions',
  'write:commissions',
  'delete:commissions',
  'read:commissions_characters',
  'write:commissions_characters',
  'delete:commissions_characters',
  'read:finance',
  'write:finance',
  'create:payment',
  'cancel:payment',
  'read:customers',
  'write:customers',
  'delete:customers',
  'manage:managers',
];

export const agentAccountUsernameSchema = z.string()
  .trim()
  .min(3, 'Username must be at least 3 characters long.')
  .max(32, 'Username is too long.')
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, dashes and underscores.');

export const agentAccountPasswordSchema = z.string()
  .min(10, 'Password must be at least 10 characters long.')
  .max(256, 'Password is too long.');

export const agentAccountSetupSchema = z.object({
  username: agentAccountUsernameSchema,
  password: agentAccountPasswordSchema,
  displayName: z.string().max(64).optional().nullable(),
});

export const agentAccountLoginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required.').max(256),
  password: z.string().min(1, 'Password is required.').max(256),
});

export const agentAccountProfilePutSchema = z.object({
  displayName: z.string().max(64).optional().nullable()
});

export const agentAccountPasskeyAlias = z.string().trim().min(1, 'Alias is required.').regex(/^[a-zA-Z0-9-_ ]+$/, 'Alias can only contain letters, numbers, spaces, hyphens, and underscores.').max(32);

export const agentAccountPasskeyOptionsSchema = z.object({
  alias: agentAccountPasskeyAlias,
});