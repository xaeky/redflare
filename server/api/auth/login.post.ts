export default defineEventHandler(async (event) => {
  const { data, error } = await readValidatedBody(event, agentAccountLoginSchema.safeParse);
  if (error || !data) throw createError({ status: 400, statusText: 'Invalid body' });
  const { username, password } = data;

  const accountsModel = useAgentAccountsModel();
  const genericError = createError({ status: 401, statusText: 'Invalid credentials' });

  const account = await accountsModel.getByUsername(username);
  if (!account) throw genericError;
  if (accountsModel.isLockedOut(account)) {
    throw createError({ status: 403, statusText: 'This account is temporarily locked due to too many failed login attempts.' });
  }

  const isValid = await accountsModel.verifyPassword(account, password);
  if (!isValid) {
    await accountsModel.recordFailedLogin(account._id.toString());
    throw genericError;
  }

  await accountsModel.resetFailedLogins(account._id.toString());

  await setUserSession(event, {
    user: {
      id: account._id.toString(),
      username: account.username,
      displayName: account.displayName || undefined,
      permissions: account.permissions,
      settings: account.settings || {}
    }
  });

  return { success: true };
});
