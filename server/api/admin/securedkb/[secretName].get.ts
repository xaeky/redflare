export default defineEventHandler(async (event) => {
  const { getSecret } = await useInfisical();
  const { secretName } = getRouterParams(event);
  if (!secretName)
    throw createError({ statusCode: 400, message: 'Missing secret name' });
  const { environment } = getQuery(event);
  const secret = await getSecret(
    secretName,
    environment?.toString() || undefined,
  );
  return secret;
});
