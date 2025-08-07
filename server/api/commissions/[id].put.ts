export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to write commissions.
  await hasPermission(event, 'write:commissions');
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'id');
  // Ensure commission ID is provided
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  // Parse request validated body
  const body = await readValidatedBody(event, commissionUpdateSchema.safeParse);
  if (!body.success) throw createError({ statusCode: 400, message: 'Invalid body', data: body.error });

  const safeCharacters = body.data.characters.map((c: any) => ({
    ...c,
    note: c.note === undefined ? null : c.note,
  }));

  const result = await useCommissionModel().updateOne(commissionId, {
    ...body.data,
    characters: safeCharacters,
  });
  return result;
});