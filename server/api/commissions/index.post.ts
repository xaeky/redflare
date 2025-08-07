export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to write commissions.
  await hasPermission(event, 'write:commissions');
  // Get validated body from request
  const trustedBody = await readValidatedBody(event, commissionOptionsSchema.safeParse);
  if (trustedBody.error) throw createError({ statusCode: 400, message: 'Invalid request body', data: trustedBody.error });
  const body = trustedBody.data;
  
  const result = await useCommissionModel().insertOne({
    ...body,
    characters: body.characters.map((c: any) => ({
      ...c,
      note: c.note === undefined ? null : c.note,
    })),
  });
  return result;
});