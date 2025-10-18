export default defineEventHandler(async (event) => {
  // Verify if they have permission to perform action
  await hasPermission(event, 'delete:commissions');
  const { id: commissionId } = await validateCommission(event);
  const result = await useCommissionModel().deleteOne(commissionId);
  return result;
});