export default defineEventHandler(async (event) => {
  const { deleteSecret } = await useInfisical();
  const { secretName } = getRouterParams(event);
  if (!secretName)
    throw createError({ statusCode: 400, message: 'Missing secret name' });
  const { environment } = getQuery(event);
  await deleteSecret(secretName, environment?.toString() || undefined);
});
