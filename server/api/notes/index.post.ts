import { noteOptionsSchema } from "~/server/schemas/Notes";
import { $supabase } from "~/server/services/supabase";

export default defineEventHandler(async (event) => {
  const session = await needAuth(event);
  if (!session.user) return;
  const body = await readValidatedBody(event, noteOptionsSchema.safeParse);
  if (!body.success) throw createError({
    statusCode: 401,
    message: 'Invalid body'
  });
  const result = await ($supabase())
    .from('notes')
    .insert({
      author: session.user.sub,
      content: body.data.content
    });
  return result.data;
});