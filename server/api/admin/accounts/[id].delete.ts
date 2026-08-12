export default defineEventHandler(async (event) => {
  await hasPermission(event, 'manage:managers', true);
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ status: 400, statusText: 'Missing account id' });

  const session = await getUserSession(event);
  if (session.user?.id === id)
    throw createError({
      status: 400,
      statusText: 'You cannot delete your own account.',
    });

  await useAgentAccountsModel().deleteOne(id);
  event.context.audit = { account_id: id };
  return { success: true };
});
