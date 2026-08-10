export default defineWebAuthnRegisterEventHandler({
  async storeChallenge(event, challenge, attemptId) {
    await setWebauthnChallenge(event, { challenge, attemptId });
  },
  async getChallenge(event, attemptId) {
    const challenge = await getWebauthnChallenge(event, attemptId);
    await clearWebauthnChallenge(event, attemptId);
    if (!challenge) {
      throw createError({ status: 400, message: 'Challenge not found for the given attemptId' });
    }
    return challenge;
  },
  async onSuccess(event, { credential, user }) {
    const agentSession = await getUserSession(event);
    // Parse alias from request body
    const { data, error } = agentAccountPasskeyAlias.safeParse(user.alias);
    if (error) throw createError({ status: 400, message: 'Invalid alias', data: error });
    const curatedCredential = {
      ...credential,
      alias: user.alias,
      belongsTo: agentSession.user?.id as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as AgentAccountPasskeyCredential;
    await useAgentAccountsModel().recordPasskeyCredential(curatedCredential);
  },
});