export default defineEventHandler(async (event) => {
  await hasPermission(event, 'read:commissions');
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'id');
  const paymentId = getRouterParam(event, 'pay_id');
  // Ensure commission & payment ID is provided
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  if (!paymentId) throw createError({ statusCode: 400, message: 'Payment ID is required' });
  // Fetch payments for the commission
  const { error, data } = await ($supabase()).from('commissions_payments')
  .select('*').eq('commission', commissionId).eq('pid', paymentId).order('created_at', { ascending: false }).single();
  if (error) throw createError({ statusCode: 500, message: error.message });
  // Return the payments data
  return data;
});