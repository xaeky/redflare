export default defineEventHandler(async (event) => {
  // Read & validate request body
  const body = await readValidatedBody(event, avatarBaseOptionsSchema.safeParse);
  if (body.error) throw createError({ statusCode: 400, data: body.error });
  // Insert commission base to database
  const result = await useAvatarBasesModel().insertOne(body.data);
  return result;
});