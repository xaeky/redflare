export default defineEventHandler(async (event) => {
  // Read & validate request body
  const body = await readValidatedBody(event, avatarBaseOptionsSchema.safeParse);
  if (body.error) throw createError({ status: 400, statusText: 'Invalid body', data: body.error });
  // Insert commission base to database
  const result = await useAvatarBasesModel().insertOne(body.data);
  await invalidateHandlerCache('avatar_bases');
  return result;
});