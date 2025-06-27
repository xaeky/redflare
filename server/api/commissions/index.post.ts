export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to write commissions.
  await hasPermission(event, 'write:commissions');
  // Get validated body from request
  const trustedBody = await readValidatedBody(event, commissionOptionsSchema.safeParse);
  if (trustedBody.error) throw createError({ statusCode: 400, message: 'Invalid request body', data: trustedBody.error });
  const body = trustedBody.data;
  // Ensure customer exists
  const customer = await ($supabase()).from('customers').select('id').eq('id', body.customer).single();
  if (customer.error || !customer.data) throw createError({ statusCode: 400, message: 'Customer not found' });
  // Write one commission.
  const content = await ($supabase()).from('commissions').insert(body).select().single();
  if (content.error) throw createError({ statusCode: 500, data: content.error });
  return content.data;
});