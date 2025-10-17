export default defineEventHandler(async (event) => {
  await hasPermission(event, 'read:commissions');
  const transactionId = await getRouterParam(event, 'transaction_id');
  if (!transactionId) throw createError({ statusCode: 400, message: 'Transaction ID is required' });
  const billingModel = useBillingModel();
  const commissionModel = useCommissionModel();
  const commissionId = await validateCommission(event);

  const result = await billingModel.deleteOne(transactionId);
  if (!result) throw createError({ statusCode: 500, message: 'Failed to delete transaction' });

  // Delete it from the commission object
  await commissionModel.removeTransactionFromOne(commissionId, transactionId);

  return result;
});