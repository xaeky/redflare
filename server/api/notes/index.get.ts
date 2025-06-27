import { $supabase } from "~/server/services/supabase";

export default defineEventHandler(async (event) => {
  const session = await needAuth(event);
  const content = await ($supabase()).from('notes').select('*').eq('author', session.user?.sub);
  return content.data;
});