export default defineEventHandler(async (event) => {
  const commissionModel = useCommissionModel();
  const currentPublicUser = await getPublicUserSession(event);
  const currentAgentUser = await getUserSession(event);
  let isAgent = currentAgentUser && currentAgentUser.user?.settings.forceAgentView;
  // TODO: Make a function to refresh the public session.
  // Skip ownership check if agent, if not agent session is present then check ownership with public user
  let isOwner = isAgent;
  if (currentAgentUser && !isAgent) {
    const currentCustomerUserId = currentPublicUser.secure.customer
      ? currentPublicUser.secure.customer 
      : (await useCustomerModel().getByDiscordId(currentPublicUser?.user?.id || ''))._id.toString();
    const { commission_id } = await getRouterParams(event);
    isOwner = await commissionModel.checkOwnershipFromOne(commission_id, currentCustomerUserId);
  }
  
  if (!isOwner) throw createError({ statusCode: 403, statusMessage: 'Unauthorized to access attachment' });
  const query = await getQuery<{ file_id: string }>(event);
  if (!query.file_id || !query.file_id.length) throw createError({ statusCode: 400, statusMessage: 'No file_id provided' });
  const decodedFileId = Buffer.from(query.file_id, 'base64').toString('utf-8');
  logger.debug(`Public commission attachment HEAD request for file ID: ${decodedFileId}`);
  const [exists] = await useStorageBucket().file(decodedFileId).exists();
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'File not found' });
  await publicGrantTempAuthorization(event, `retrieve_commission_attachment:${decodedFileId}`);
  return true
});