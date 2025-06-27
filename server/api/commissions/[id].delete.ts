export default defineEventHandler(async (event) => {
  // Verify if they have permission to perform action
  await hasPermission(event, 'delete:commissions');
  // Get commission ID
  const commissionId = getRouterParam(event, 'id');
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  // Delete commission from database
  const { data, error } = await $supabase()
    .from('commissions').delete().eq('id', commissionId).select();
  if (error) throw createError({ statusCode: 500, data: error });
  // Return deleted commission data
  return data;
});