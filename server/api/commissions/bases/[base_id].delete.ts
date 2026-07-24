import { AuditAction, AuditCategory } from "~~/shared/enums/Audit";

export default defineEventHandler(async (event) => {
  const baseId = getRouterParam(event, 'base_id');
  if (!baseId) throw createError({ status: 400, statusText: 'Base ID is required' });
  // Delete base from database
  const result = await useAvatarBasesModel().deleteOne(baseId);
  await auditOperation(event, {
    category: AuditCategory.AvatarBase,
    action: AuditAction.Delete,
    details: {
      avatar_base_id: baseId
    },
  });
  return result;
});