export default defineEventHandler(async (event) => {
  await setPublicUserSession(event, {
    user: {
      username: 'PublicUser',
      id: process.env.TEST_PUBLIC_DISCORDID || '000000000000000000',
      discriminator: '0',
      global_name: 'PublicUser'
    } as DiscordOAuthUser,
    secure: {
      access_token: 'test',
      customer: process.env.TEST_PUBLIC_CUSTOMERID || ''
    }
  });
  await initCurrentUserSettings(event);
  logger.info('Test public session claimed');
  return sendRedirect(event, '/me');
});