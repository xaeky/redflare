export default defineEventHandler(async (event) => {
  const transactionId = getRouterParam(event, 'transaction_id');
  if (!transactionId) throw createError({ status: 400, statusText: 'Missing transaction ID' });
  const safeBody = await readValidatedBody(event, commissionPaymentUpdateSchema.safeParse);
  if (!safeBody.success) throw createError({ status: 400, statusText: 'Invalid body' });
  
  const billingModel = useBillingModel();
  const updateResult = await billingModel.updateOne(transactionId, safeBody.data);
  if (!updateResult) throw createError({ status: 500, statusText: 'Failed to update transaction' });
  event.context.audit = {
    transaction_id: transactionId,
    body: safeBody.data
  };
  return { success: true };
});