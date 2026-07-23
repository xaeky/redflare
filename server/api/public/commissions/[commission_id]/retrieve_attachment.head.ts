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
  
  if (!isOwner) throw createError({ status: 403, statusText: 'Unauthorized to access attachment' });
  const query = await getQuery<{ file_id: string }>(event);
  if (!query.file_id || !query.file_id.length) throw createError({ status: 400, statusText: 'No file_id provided' });
  const destinationPath = `avatars/${query.file_id}`;
  if (!(await bucketFileExists(destinationPath))) throw createError({ status: 404, statusText: 'File not found' });
  await publicGrantTempAuthorization(event, `retrieve_commission_attachment:${query.file_id}`);
  return true
});