import * as z from 'zod';

export const noteOptionsSchema = z.object({
  content: z.string()
    .max(1024, 'Note body is too long.')
    .nonempty('Note body cannot be empty.')
});
