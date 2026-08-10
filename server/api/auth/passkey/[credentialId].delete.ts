export default defineEventHandler(async (event) => {
  const session = await needAuth(event);
  const credentialId = getRouterParam(event, 'credentialId');
  if (!credentialId) throw createError({ status: 400, statusText: 'Missing credential id' });
  
  await useAgentAccountsModel().deletePasskeyCredential(session.user?.id as string, credentialId);
  event.context.audit = { account_id: session.user?.id, credential_id: credentialId };
  return { success: true };
});