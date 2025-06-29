export default defineEventHandler(async (event) => {
  await hasPermission(event, 'read:commissions_characters');
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'id');
  // Ensure commission ID is provided
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  // Fetch characters for the commission
  const { error, data } = await ($supabase()).from('commissions_characters')
  .select('*, base(id,name,creator_name)').eq('commission', commissionId).order('created_at', { ascending: false });
  if (error) throw createError({ statusCode: 500, message: error.message });
  // Assign characters array to the charactersObject with lodash
  if (!data || !Array.isArray(data)) throw createError({ statusCode: 404, message: 'No characters found for this commission' });
  // Return the characters data
  return data;
});