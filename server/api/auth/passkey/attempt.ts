export default defineWebAuthnAuthenticateEventHandler({
  async getCredential(_event, credentialId) {
    const credential =
      await useAgentAccountsModel().getPasskeyCredentialById(credentialId);

    if (!credential)
      throw createError({ status: 400, message: 'Credential not found' });

    return credential as AgentAccountPasskeyCredential;
  },
  async onSuccess(event, { credential, authenticationInfo }) {
    const accountsModel = useAgentAccountsModel();
    const account = await accountsModel.getById(credential.belongsTo as string);
    await accountsModel.recordPasskeyLastUsage(credential.id);
    await accountsModel.setPasskeyCounter(
      credential.id,
      authenticationInfo.newCounter,
    );
    await setUserSession(event, {
      user: {
        id: account._id.toString(),
        username: account.username,
        displayName: account.displayName || undefined,
        permissions: account.permissions,
        settings: account.settings || {},
      },
    });
  },
});
