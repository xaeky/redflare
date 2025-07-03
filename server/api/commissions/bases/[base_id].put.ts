export default defineEventHandler(async (event) => {
  // TODO: Add permission gate
  // Get base ID
  const baseId = getRouterParam(event, 'base_id');
  if (!baseId) throw createError({ statusCode: 400, message: 'Base ID is required' });
  // Read & validate request body
  const body = await readValidatedBody(event, commissionBaseOptionsSchema.safeParse);
  if (body.error) throw createError({ statusCode: 400, data: body.error });
  // Delete commission from database
  const { data, error } = await $supabase()
    .from('commissions_bases').update(body.data)
    .eq('id', baseId).select();
  if (error) throw createError({ statusCode: 500, data: error });
  // Return deleted commission data
  return data;
});