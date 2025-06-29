export default defineEventHandler(async (event) => {
  await hasPermission(event, 'read:commissions_characters');
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'id');
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  // Character ID from request parameters
  const charId = getRouterParam(event, 'char_id');
  if (!charId) throw createError({ statusCode: 400, message: 'Character ID is required' });
  if (isNaN(Number(charId))) throw createError({ statusCode: 400, message: 'Character ID must be a number' });
  // Fetch character
  const { error, data } = await ($supabase()).from('commissions_characters')
  .select('*, base(id,name,creator_name)')
  .eq('commission', commissionId).eq('id', Number(charId))
  .single();
  if (error) throw createError({ statusCode: 500, message: error.message, data: error });
  return data;
});