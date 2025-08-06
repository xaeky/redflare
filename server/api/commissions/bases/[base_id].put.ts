export default defineEventHandler(async (event) => {
  // Get base ID
  const baseId = getRouterParam(event, 'base_id');
  if (!baseId) throw createError({ statusCode: 400, message: 'Base ID is required' });
  // Read & validate request body
  const body = await readValidatedBody(event, avatarBaseOptionsSchema.safeParse);
  if (body.error) throw createError({ statusCode: 400, data: body.error });
  // Update commission in database
  const result = await useAvatarBasesModel().updateOne(baseId, body.data);
  return result;
});