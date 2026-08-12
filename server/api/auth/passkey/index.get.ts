export default defineEventHandler(async (event) => {
  const session = await needAuth(event);
  const credentials =
    await useAgentAccountsModel().listPasskeyCredentialsForAccount(
      session.user?.id as string,
    );
  // Delete sensitive fields
  return credentials.map(({ publicKey, transports, ...rest }) => rest);
});
