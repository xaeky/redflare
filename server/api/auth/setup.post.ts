export default defineEventHandler(async (event) => {
  // Guard against re-running setup once the app has already been set up.
  // Note: this check-then-act isn't fully atomic against a concurrent double-submit,
  // but this is a one-time bootstrap flow, not a high-frequency/high-risk endpoint.
  if (await isSetupLocked()) throw createError({ status: 403, statusText: 'This app has already been set up.' });

  const { data, error } = await readValidatedBody(event, agentAccountSetupSchema.safeParse);
  if (error || !data) throw createError({ status: 400, statusText: 'Invalid body', data: error });
  const { username, password, displayName } = data;

  const accountsModel = useAgentAccountsModel();
  const result = await accountsModel.insertOne({
    username,
    password,
    displayName,
    permissions: ALL_PERMISSIONS
  });

  await lockSetup(username);

  await setUserSession(event, {
    user: {
      id: result.insertedId.toString(),
      username,
      displayName: displayName || undefined,
      permissions: ALL_PERMISSIONS,
      settings: {}
    }
  });

  return { success: true };
});
