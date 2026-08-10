export default defineEventHandler(async (event) => {
  await hasPermission(event, 'manage:managers', true);

  const { data, error } = await readValidatedBody(event, agentAccountSetupSchema.safeParse);
  if (error || !data) throw createError({ status: 400, statusText: 'Invalid body', data: error });
  const { username, password, displayName } = data;

  const result = await useAgentAccountsModel().insertOne({
    username,
    password,
    displayName,
    permissions: ALL_PERMISSIONS
  });

  event.context.audit = {
    account_id: result.insertedId.toString(),
    username
  };

  return { success: true, id: result.insertedId.toString() };
});
