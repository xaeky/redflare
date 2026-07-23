export default defineEventHandler(async (event) => {
  // Get base ID
  const baseId = getRouterParam(event, 'base_id');
  if (!baseId) throw createError({ status: 400, statusText: 'Base ID is required' });
  // Delete base from database
  const result = await useAvatarBasesModel().deleteOne(baseId);
  return result;
});