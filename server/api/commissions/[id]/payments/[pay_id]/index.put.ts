export default defineEventHandler(async (event) => {
  // TODO: Add permission for updating payments in Auth0
  // await hasPermission(event, 'update:payment');
  // Read the validated body from the event
  const body = await readValidatedBody(event, commissionPaymentUpdateSchema.safeParse);
  if (!body.success) throw createError({ statusCode: 400, message: 'Invalid body' });
  // Get the commission ID and payment ID from the route parameters
  const commission_id = getRouterParam(event, 'id');
  const payment_id = getRouterParam(event, 'pay_id');
  if (!commission_id) throw createError({ statusCode: 400, message: 'Missing commission ID' });
  if (!payment_id) throw createError({ statusCode: 400, message: 'Missing payment ID' });
  // Check if commission exists
  const commissionExists = await ($supabase()).from('commissions').select('id').eq('id', commission_id).single();
  if (commissionExists.error || !commissionExists.data) throw createError({ statusCode: 404, message: 'Commission not found' });
  // Check if payment exists
  const paymentExists = await ($supabase()).from('commissions_payments').select('pid').eq('pid', payment_id).eq('commission', commission_id).single();
  if (paymentExists.error || !paymentExists.data) throw createError({ statusCode: 404, message: 'Payment not found' });
  // Prepare the update object
  const { public_note, secure_note, state } = body.data;
  const updateObject: CommissionPaymentUpdate = {
    public_note: public_note || null,
    secure_note: secure_note || null,
    state: state || undefined // Allow state to be undefined if not provided
  };
  // Update the payment in the database
  const { data, error } = await ($supabase()).from('commissions_payments')
  .update(updateObject).eq('pid', payment_id)
  .eq('commission', commission_id).select('*').single();
  if (error) throw createError({ statusCode: 500, message: 'Failed to update payment' });
  // Return the updated payment
  return data;
});