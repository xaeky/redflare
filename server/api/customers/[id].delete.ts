import { AuditAction, AuditCategory } from '~~/shared/enums/Audit';

export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to delete customers.
  await hasPermission(event, 'delete:customers', true);
  const session = await getUserSession(event);
  // Get customer ID
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ status: 400, statusText: 'Customer ID is required' });
  // Delete it
  const result = await useCustomerModel().deleteOne(id);
  await auditOperation(event, {
    category: AuditCategory.Customer,
    action: AuditAction.Delete,
    details: {
      customer_id: id
    },
  });
  return result;
});