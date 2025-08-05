import _ from 'lodash';
import { useSession, createError, H3Event } from 'h3';
import { UserInfoClient, AuthenticationClient, ManagementClient } from 'auth0';
import { SecureSessionData } from '#auth-utils';
import { decode, JwtPayload } from 'jsonwebtoken';

type EventUserSession = Parameters<typeof useSession>[0];

export async function needAuth(event: EventUserSession) {
  // Get app config
  const runtime = useRuntimeConfig(event as H3Event);
  // Get user session, check if defined or not, if not throw 401 error
  const userSession = await getUserSession(event);
  if (!_.get(userSession, 'user') || !_.get(userSession, 'secure.access_token')) throw createError({ statusCode: 401, message: 'Unauthorized' });
  // So user exists on session, now we're going to validate it
  const { domain, clientId, clientSecret } = runtime.oauth.auth0;
  const { access_token, refresh_token, id_token } = userSession.secure as SecureSessionData;
  const a0User = new UserInfoClient({ domain });
  const a0Auth = new AuthenticationClient({ domain, clientId, clientSecret });
  // Get if user exists
  try {
    const userInfo = await a0User.getUserInfo(access_token);
    if (!userInfo.data || userInfo.status !== 200) throw new Error(userInfo.statusText);
  } catch (e) {
    const err = e as Error;
    throw createError({ statusCode: 403, message: 'Forbidden', statusMessage: err.message || 'Failed to fetch user details.' });
  }
  // User exists, now we try to update the token if it's expired
  const decoded = decode(access_token) as JwtPayload || decode(id_token) as JwtPayload;
  const isSessionExpired = !decoded.exp || Date.now() >= (decoded.exp as number) * 1000;
  if (!isSessionExpired) return userSession;
  try {
    const refreshResult = await a0Auth.oauth.refreshTokenGrant({ refresh_token });
    if (!refreshResult.data) throw new Error();
    const newSession = await replaceUserSession(event as H3Event, {
      secure: {
        access_token: refreshResult.data.access_token,
        refresh_token: refreshResult.data.refresh_token,
        id_token: refreshResult.data.id_token
      }
    });
    return newSession;
  } catch (e) {
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
  const permissions = await getPermissions(event, false);
  const runtime = useRuntimeConfig();
  // Skip permission check if runtime config allows it
  if (runtime.backoffice.skipRoles) return true;
  const itHasPermission = permissions.includes(permissionName);
  if (throwError && !itHasPermission) throw createError({ statusCode: 403, statusMessage: 'Missing permissions to perform this action' });
  return permissions.includes(permissionName);
}