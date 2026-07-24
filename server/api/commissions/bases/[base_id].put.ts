export default defineEventHandler(async (event) => {
  const baseId = getRouterParam(event, 'base_id');
  if (!baseId) throw createError({ status: 400, statusText: 'Base ID is required' });
  // Read & validate request body
  const body = await readValidatedBody(event, avatarBaseOptionsSchema.safeParse);
  if (body.error) throw createError({ status: 400, statusText: 'Invalid body', data: body.error });
  // Update avatar base in database
  const result = await useAvatarBasesModel().updateOne(baseId, body.data);
  await invalidateFunctionCache('avatar_bases_getAll', '*');
  event.context.audit = {
    avatar_base_id: baseId,
  };
  return result;
});