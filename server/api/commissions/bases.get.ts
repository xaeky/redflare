export default defineEventHandler(async (event) => {
  // TODO: Add permission gate
  // TODO: Add pagination
  const { data, error } = await ($supabase()).from('commissions_bases').select('*').limit(50);
  if (error || !data) throw createError({ statusCode: 500, data: error });
  return data;
});