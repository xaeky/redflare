export default defineEventHandler(async (event) => {
  // Check if user is logged in
  const publicSession = await getPublicUserSession(event);
  const { user } = publicSession;
  if (!user) throw createError({ status: 401, statusText: 'Not authenticated' });
  // Revoke Discord's token if exists before clearing session
  const runtimeConfig = useRuntimeConfig();
  const { clientId: client_id, clientSecret: client_secret } = runtimeConfig.frontoffice.oauth.discord;
  try {
    await $fetch('https://discord.com/api/oauth2/token/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        token: (await getPublicUserSession(event)).secure.access_token,
        token_type_hint: 'access_token',
        client_id, client_secret
      }).toString()
    });
  } catch (error) {
    logger.warn('Failed to revoke Discord token:', (error as Error).message);
  }
  // Clear session
  await clearPublicUserSession(event);
  return { success: true };
});