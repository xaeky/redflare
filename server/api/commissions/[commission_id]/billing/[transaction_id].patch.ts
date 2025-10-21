export default defineEventHandler(async (event) => {
  const transactionId = getRouterParam(event, 'transaction_id');
  if (!transactionId) throw createError({ statusCode: 400, message: 'Missing transaction ID' });
  const safeBody = await readValidatedBody(event, commissionPaymentUpdateSchema.safeParse);
  if (!safeBody.success) throw createError({ statusCode: 400, message: 'Invalid body' });
  
  const billingModel = useBillingModel();
  const updateResult = await billingModel.updateOne(transactionId, safeBody.data);
  if (!updateResult) throw createError({ statusCode: 500, message: 'Failed to update transaction' });

  return { success: true };
});