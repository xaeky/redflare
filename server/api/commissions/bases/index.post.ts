export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(
    event,
    avatarBaseOptionsSchema.safeParse,
  );
  if (body.error)
    throw createError({
      status: 400,
      statusText: 'Invalid body',
      data: body.error,
    });
  const result = await useAvatarBasesModel().insertOne(body.data);
  await invalidateFunctionCache('avatar_bases_getAll', '*');
  event.context.audit = {
    avatar_base_id: result.insertedId.toString(),
  };
  return result;
});
