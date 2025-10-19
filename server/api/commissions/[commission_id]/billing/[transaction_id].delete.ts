export default defineEventHandler(async (event) => {
  await hasPermission(event, 'read:commissions');
  const transactionId = await getRouterParam(event, 'transaction_id');
  if (!transactionId) throw createError({ statusCode: 400, message: 'Transaction ID is required' });
  const billingModel = useBillingModel();
  const commissionModel = useCommissionModel();
  const { id: commissionId } = await validateCommission(event);
  
  // Delete it from the commission object
  await commissionModel.removeTransactionFromOne(commissionId, transactionId);

  // If transaction has no parents, delete it entirely
  const hasParents = (await billingModel.getParentsByTransaction(transactionId)).length > 0;
  if (!hasParents) {
    const result = await billingModel.deleteOne(transactionId);
    if (!result) throw createError({ statusCode: 500, message: 'Failed to delete transaction' });
  }
  return { success: true, deletedCompletely: !hasParents };
});