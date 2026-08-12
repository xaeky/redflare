import { z } from 'zod';

export default defineEventHandler(async (event) => {
  const agentSession = await needAuth(event);
  const agentAccount = await useAgentAccountsModel().getById(
    agentSession.user?.id as string,
  );
  const intentToken = getRouterParam(event, 'intentToken');
  if (!intentToken)
    throw createError({ status: 400, message: 'Missing intent token' });

  // Look up the confirmation intent in the cache
  const confirmationCache = useConfirmationCache();
  const intentData = await confirmationCache.get<AgentConfirmIntent>(
    `confirmation-intent-${intentToken}`,
  );
  if (!intentData)
    throw createError({
      status: 404,
      message: 'Confirmation intent not found or expired',
    });

  // Challenge based on proof of possession. Current user shall confirm the action by providing their password
  const { data, success } = await readValidatedBody(
    event,
    z.object({ password: z.string().min(1) }).safeParse,
  );
  if (!success)
    throw createError({ status: 400, message: 'Invalid request body' });
  const isCredentialValid = await useAgentAccountsModel().verifyPassword(
    agentAccount,
    data.password,
  );
  if (!isCredentialValid)
    throw createError({ status: 403, message: 'Invalid password' });

  return await approveConfirmationIntent(intentToken);
});
