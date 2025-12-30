import _ from 'lodash';
import { useSession, createError, H3Event } from 'h3';
import { UserInfoClient, AuthenticationClient, ManagementClient } from 'auth0';
import type { SecureSessionData } from '#auth-utils';
import { decode, JwtPayload } from 'jsonwebtoken';
import cache from './cache';

type EventUserSession = Parameters<typeof useSession>[0];

export async function needAuth(event: EventUserSession) {
  const runtime = useRuntimeConfig(event as H3Event);
  // Get user session, check if defined or not, if not throw 401 error
  const userSession = await getUserSession(event);
  if (!_.get(userSession, 'user') || !_.get(userSession, 'secure.access_token')) throw createError({ statusCode: 401, message: 'Unauthorized' });
  // So user exists on session, now we're going to validate it, use cache to avoid multiple calls
  const cacheKey = `auth0-session-${userSession.user?.sub}`;
  let cachedSession = await cache.get<boolean>(cacheKey);
  const { domain, clientId, clientSecret } = runtime.oauth.auth0;
  const { refresh_token, id_token } = userSession.secure as SecureSessionData;
  const a0Manager = new ManagementClient({ domain, clientId, clientSecret });
  const a0Auth = new AuthenticationClient({ domain, clientId, clientSecret });
  const decodedIdAuth = decode(id_token) as JwtPayload;
  // If no cache is present, validate the user by fetching its details
  if (!cachedSession) {
    try {
      const userInfo = await a0Manager.users.get({ id: decodedIdAuth.sub as string });
      if (!userInfo.data || userInfo.status !== 200) throw new Error(userInfo.statusText);
      await cache.set<boolean>(cacheKey, true);
      logger.debug('User session validated for user:', decodedIdAuth.sub);
    } catch (e) {
      const err = e as Error;
      logger.error('Auth0Error:', e);
      throw createError({ statusCode: 403, message: 'Forbidden', statusMessage: `Auth0Error: ${err.message}` || 'Failed to fetch user details.' });
    }
  }
  // User exists, now we try to update the token if it's expired
  const isSessionExpired = !decodedIdAuth.exp || Date.now() >= (decodedIdAuth.exp as number) * 1000;
  if (!isSessionExpired) return userSession;
  if (isSessionExpired && !refresh_token) {
    clearUserSession(event as H3Event);
    throw createError({ statusCode: 403, message: 'Forbidden', statusMessage: 'Your refresh token is missing or expired.' });
  }
  try {
    logger.debug('Session expired, attempting to refresh for user:', decodedIdAuth.sub);
    const refreshResult = await a0Auth.oauth.refreshTokenGrant({ refresh_token, scope: 'offline_access openid profile email' });
    if (!refreshResult.data) throw new Error();
    const newSession = await replaceUserSession(event as H3Event, {
      secure: {
        access_token: refreshResult.data.access_token,
        refresh_token: refreshResult.data.refresh_token,
        id_token: refreshResult.data.id_token
      }
    });
    const newDecodedIdAuth = decode(refreshResult.data.id_token as string) as JwtPayload;
    logger.debug('Session refreshed for user:', newDecodedIdAuth.sub);
    return newSession;
  } catch (e) {
    logger.error('Failed to refresh session:', e);
    clearUserSession(event as H3Event);
    throw createError({ statusCode: 403, message: 'Forbidden', statusMessage: 'Your session has expired.' });
  }
}

export async function getPermissions(event: EventUserSession, useTrustedSession:boolean = true) {
  // Get (and refresh) the user session if useTrustedSession is true,
  // if such variable is not true, use session provided by server that might be outdated.
  // Useful to speed up certain processes.
  const session = useTrustedSession ? await needAuth(event) : await getUserSession(event);
  if (!session.user) throw createError({ statusCode: 500, statusMessage: 'Could not read user from the session key.' });
  // Get app config
  const runtime = useRuntimeConfig(event as H3Event);
  const { domain, clientId, clientSecret } = runtime.oauth.auth0;
  const a0Manager = new ManagementClient({ domain, clientId, clientSecret });
  // Fetch permissions and return them
  try {
    const curretPermissions = await a0Manager.users.getPermissions({ id: session.user.sub as string });
    const mappedPermissions = curretPermissions.data.map(p => p.permission_name);
    return mappedPermissions as Permission[];
  } catch (e) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch permissions' });
  }
}

export async function hasPermission(event: EventUserSession, permissionName: Permission, throwError?: boolean) {
  const runtime = useRuntimeConfig();
  // Skip permission check if runtime config allows it
  if (runtime.backoffice.skipRoles) {
    logger.warn(`Skipping permission check for "${permissionName}" due to runtime config setting.`);
    return true;
  }
  const permissions = await getPermissions(event, false);
  const itHasPermission = permissions.includes(permissionName);
  if (throwError && !itHasPermission) throw createError({ statusCode: 403, statusMessage: 'Missing permissions to perform this action' });
  return permissions.includes(permissionName);
}

export async function updateCurrentUserPassword(event: EventUserSession, oldPassword: string, newPassword: string) {
  const session = await needAuth(event);
  const runtime = useRuntimeConfig(event as H3Event);
  const { domain, clientId, clientSecret } = runtime.oauth.auth0;
  const { id_token } = session.secure as SecureSessionData;
  const decodedIdAuth = decode(id_token) as JwtPayload;
  const a0Manager = new ManagementClient({ domain, clientId, clientSecret });
  const a0Auth = new AuthenticationClient({ domain, clientId, clientSecret });
  // Verify user's old password by trying to authenticate
  try {
    const result = await a0Auth.oauth.passwordGrant({
      username: decodedIdAuth.name as string,
      password: oldPassword,
      scope: 'openid',
      realm: 'Username-Password-Authentication',
    });
    if (!result.data || result.status !== 200) throw new Error(result.statusText);
  } catch (e) {
    const err = e as Error;
    logger.error('Auth0Error:', e);
    throw createError({ statusCode: 403, statusMessage: `Auth0Error: ${err.message}` || 'Credentials are invalid or internal Auth0 error.' });
  }
  // If we reach this point, the old password is correct, so we can update to the new password
  try {
    const updateResult = await a0Manager.users.update({ id: session.user?.sub as string }, { password: newPassword });
    if (!updateResult.data || updateResult.status !== 200) throw new Error(updateResult.statusText);
    return true;
  } catch (e) {
    const err = e as Error;
    logger.error('Auth0Error:', e);
    throw createError({ statusCode: 500, statusMessage: `Auth0Error: ${err.message}` || 'Failed to update user password.' });
  }
};

export async function updateCurrentUserProfile(event: EventUserSession, profileUpdateData: Record<string, any>) {
  const session = await needAuth(event);
  const runtime = useRuntimeConfig(event as H3Event);
  const { domain, clientId, clientSecret } = runtime.oauth.auth0;
  const a0Manager = new ManagementClient({ domain, clientId, clientSecret });
  try {
    const updateResult = await a0Manager.users.update({ id: session.user?.sub as string }, profileUpdateData);
    if (!updateResult.data || updateResult.status !== 200) throw new Error(updateResult.statusText);
    await setUserSession(event as H3Event, {
      user: { nickname: updateResult.data.nickname, picture: updateResult.data.picture }
    });
    return true;
  } catch (e) {
    const err = e as Error;
    logger.error('Auth0Error:', e);
    throw createError({ statusCode: 500, statusMessage: `Auth0Error: ${err.message}` || 'Failed to update user profile.' });
  }
}

// Agent user settings

export async function initCurrentUserSettings(event: EventUserSession) {
  const session = await needAuth(event);
  const userSettings = session?.user?.settings || {};
  const defaultSettings: AgentUserSettings = {
    forceAgentView: false
  };
  const mergedSettings = _.merge({}, defaultSettings, userSettings);
  await setUserSession(event as H3Event, {
    user: { settings: mergedSettings }
  });
  return mergedSettings;
}

export async function updateCurrentUserSetting(event: EventUserSession, settingKey: keyof AgentUserSettings, settingValue: any) {
  const userSettings = await initCurrentUserSettings(event);
  userSettings[settingKey] = settingValue;
  await setUserSession(event as H3Event, {
    user: { settings: userSettings }
  });
  return true;
}

export async function replaceCurrentUserSettings(event: EventUserSession, newSettings: Partial<AgentUserSettings>) {
  const userSettings = await initCurrentUserSettings(event);
  const updatedSettings = { ...userSettings, ...newSettings };
  await setUserSession(event as H3Event, {
    user: { settings: updatedSettings }
  });
  return true;
}

export async function getCurrentUserSetting(event: EventUserSession, settingKey: keyof AgentUserSettings) {
  const userSettings = await initCurrentUserSettings(event);
  return userSettings[settingKey];
}