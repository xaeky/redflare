import { AuditAction, AuditCategory } from '~~/shared/enums/Audit';

export default defineEventHandler(async (event) => {
  // Verify if they have permission to perform action
  await hasPermission(event, 'delete:commissions');
  const { id: commissionId } = await validateCommission(event);
  const result = await useCommissionModel().deleteOne(commissionId);
  await auditOperation(event, {
    category: AuditCategory.Commission,
    action: AuditAction.Delete,
    details: {
      commission_id: commissionId
    },
  });
  return result;
});