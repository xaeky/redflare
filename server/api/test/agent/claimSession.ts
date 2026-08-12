import type { UserSession } from '#auth-utils';

export default defineEventHandler(async (event) => {
  await setUserSession(event, {
    user: {
      id: 'test-agent',
      username: 'Test Agent',
      permissions: ALL_PERMISSIONS,
    },
  } as UserSession);
  await initCurrentUserSettings(event);
  logger.info('Test agent session claimed');
  return sendRedirect(event, '/dashboard');
});
