export default defineEventHandler(async (event) => {
  // Get base ID
  const baseId = getRouterParam(event, 'base_id');
  if (!baseId) throw createError({ statusCode: 400, message: 'Base ID is required' });
  // Delete commission from database
  const result = await useAvatarBasesModel().deleteOne(baseId);
  return result;
});