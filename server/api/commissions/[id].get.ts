export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to read commissions.
  await hasPermission(event, 'read:commissions', true);
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'id');
  // Ensure commission ID is provided
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  const { data, error } = await $supabase()
    .from('commissions').select('*, customer:customers(*), payments:commissions_payments(*)')
    .eq('id', commissionId).single();
  if (error) throw createError({ statusCode: 500, data: error });
  // Return commission data
  return data;
});