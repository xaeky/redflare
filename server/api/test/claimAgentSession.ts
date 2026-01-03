import { UserSession } from "#auth-utils";

export default defineEventHandler(async (event) => {
  await setUserSession(event, {
    user: {
      name: 'Test Agent',
      nickname: 'test_agent',
      picture: 'https://avatar.iran.liara.run/public',
      sub: 'auth0|test_agent_123',
    },
    secure: {
      access_token: 'test',
      refresh_token: 'test',
      id_token: 'test'
    }
  } as UserSession);
  await initCurrentUserSettings(event);
  logger.info('Test agent session claimed');
  return sendRedirect(event, '/dashboard');
});