import { $supabase } from "~/server/services/supabase";

export default defineEventHandler(async (event) => {
  const session = await needAuth(event);
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400 })
  const content = await ($supabase())
    .from('notes')
    .delete()
    .eq('author', session.user?.sub)
    .eq('id', id);
  return content.data;
});