import { z } from 'zod';

export const customerOptionsSchema = z.object({
  name: z.string()
    .max(64, 'Name is too long.')
    .nonempty('Name cannot be empty.'),
  vrc_id: z.string().optional().nullable(),
  note: z.string()
    .max(1024, 'Note body is too long.')
    .optional().nullable()
});