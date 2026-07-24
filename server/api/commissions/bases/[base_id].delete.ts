export default defineEventHandler(async (event) => {
  const baseId = getRouterParam(event, 'base_id');
  if (!baseId) throw createError({ status: 400, statusText: 'Base ID is required' });
  // Delete base from database
  const result = await useAvatarBasesModel().deleteOne(baseId);
  await invalidateFunctionCache('avatar_bases_getAll', '*');
  event.context.audit = {
    avatar_base_id: baseId,
  };
  return result;
});