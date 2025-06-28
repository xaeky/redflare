export default defineEventHandler(async (event) => {
  await hasPermission(event, 'create:payment');
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'id');
  // Ensure commission ID is provided
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  // Fetch payments for the commission
  const { error, data } = await ($supabase()).from('commissions_payments')
  .select('*').eq('commission', commissionId).order('created_at', { ascending: false });
  if (error) throw createError({ statusCode: 500, message: error.message });
  // Return the payments data
  return data;
});