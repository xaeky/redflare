export default defineEventHandler(async (event) => {
  // Get base ID
  const baseId = getRouterParam(event, 'base_id');
  if (!baseId) throw createError({ status: 400, statusText: 'Base ID is required' });
  // Read & validate request body
  const body = await readValidatedBody(event, avatarBaseOptionsSchema.safeParse);
  if (body.error) throw createError({ status: 400, statusText: 'Invalid body', data: body.error });
  // Update commission in database
  const result = await useAvatarBasesModel().updateOne(baseId, body.data);
  await invalidateHandlerCache('avatar_bases');
  return result;
});