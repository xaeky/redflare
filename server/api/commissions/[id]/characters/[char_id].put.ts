export default defineEventHandler(async (event) => {
  await hasPermission(event, 'write:commissions_characters');
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'id');
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  // Character ID from request parameters
  const charId = getRouterParam(event, 'char_id');
  if (!charId) throw createError({ statusCode: 400, message: 'Character ID is required' });
  if (isNaN(Number(charId))) throw createError({ statusCode: 400, message: 'Character ID must be a number' });
  // Read validated body
  const body = await readValidatedBody(event, commissionCharacterOptionsSchema.safeParse);
  if (!body.success) throw createError({ statusCode: 400, message: body.error.message, data: body.error });
  // Update commission character
  const { name, note, changelog, base } = body.data;
  const { data, error } = await ($supabase()).from('commissions_characters')
    .update({ name, note, changelog, base })
    .eq('commission', commissionId)
    .eq('id', Number(charId))
    .select('*, base(id,name,creator_name)')
    .single();
  if (error) throw createError({ statusCode: 500, message: error.message, data: error });
  return data;
})