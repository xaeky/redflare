export default defineEventHandler(async (event) => {
  // TODO: Add permission gate
  // Read & validate request body
  const body = await readValidatedBody(event, commissionBaseOptionsSchema.safeParse);
  if (body.error) throw createError({ statusCode: 400, data: body.error });
  // Insert commission base to database
  const { data, error } = await ($supabase()).from('commissions_bases').insert(body.data).select('*').single();
  if (error || !data) throw createError({ statusCode: 500, data: error });
  return data;
});