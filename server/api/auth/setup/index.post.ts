export default defineEventHandler(async (event) => {
  await needTurnstileVerification(event);
  // Guard against re-running setup once the app has already been set up.
  // Note: this check-then-act isn't fully atomic against a concurrent double-submit,
  // but this is a one-time bootstrap flow, not a high-frequency/high-risk endpoint.
  if (await isSetupLocked()) throw createError({ status: 403, message: 'This app has already been set up.' });

  const { data, success } = await readValidatedBody(event, agentAccountSetupSchema.safeParse);
  if (!success) throw createError({ status: 400, message: 'Invalid body' });
  const { username, password, displayName, setupToken } = data;

  await lockSetup(username, setupToken);

  const accountsModel = useAgentAccountsModel();
  const result = await accountsModel.insertOne({
    username,
    password,
    displayName,
    permissions: ALL_PERMISSIONS
  });

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
