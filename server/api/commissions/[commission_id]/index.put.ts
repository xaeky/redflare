export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to write commissions.
  await hasPermission(event, 'write:commissions');
  const { id: commissionId } = await validateCommission(event);
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

  // Confirm attachments ownership and move them to permanent storage
  try {
    logger.info('Confirming attachments for commission', { commissionId });
    await useCommissionModel().confirmAllAttachmentsFromOne(commissionId);
  } catch (error) {
    logger.error('Failed to confirm attachments for commission', { commissionId, error });
    throw createError({ statusCode: 500, message: 'Failed to confirm attachments' });
  }
  return result;
});