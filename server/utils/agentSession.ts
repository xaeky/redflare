import _ from 'lodash';
import { useSession, createError, H3Event } from 'h3';
import cache from './cache';

type EventUserSession = Parameters<typeof useSession>[0];

export async function needAuth(event: EventUserSession) {
  // Get user session, check if defined or not, if not throw 401 error
  const userSession = await getUserSession(event);
  // On test environment, skip auth checks
  if (isTestEnv) return userSession;
  if (!_.get(userSession, 'user.id')) throw createError({ status: 401, statusText: 'Unauthorized' });
  const userId = userSession.user!.id as string;
  // Validate the account still exists (and isn't locked out), cached briefly to avoid a Mongo hit on every request
  const cacheKey = `agent-account-${userId}`;
  let cachedSession = await cache.get<boolean>(cacheKey);
  if (!cachedSession) {
    const accountsModel = useAgentAccountsModel();
    const account = await accountsModel.getById(userId).catch(() => null);
    if (!account) {
      clearUserSession(event as H3Event);
      throw createError({ status: 403, statusText: 'Your account no longer exists.' });
    }
    if (accountsModel.isLockedOut(account)) {
      clearUserSession(event as H3Event);
      throw createError({ status: 403, statusText: 'This account is temporarily locked.' });
    }
    await cache.set<boolean>(cacheKey, true);
  }
  return userSession;
}

export async function getPermissions(event: EventUserSession, useTrustedSession: boolean = true) {
  // Get (and validate) the user session if useTrustedSession is true,
  // if such variable is not true, use session provided by server that might be outdated.
  // Useful to speed up certain processes.
  const session = useTrustedSession ? await needAuth(event) : await getUserSession(event);
  if (!session.user) throw createError({ status: 500, statusText: 'Could not read user from the session key.' });
  if (!useTrustedSession) return (session.user.permissions || []) as Permission[];
  // Re-pull permissions from Mongo so admin-driven changes propagate without requiring re-login
  const account = await useAgentAccountsModel().getById(session.user.id as string);
  return (account.permissions || []) as Permission[];
}

export async function hasPermission(event: EventUserSession, permissionName: Permission, throwError?: boolean) {
  const runtime = useRuntimeConfig();
  // Skip permission check if runtime config allows it
  if (runtime.backoffice.skipRoles) return true;
  const permissions = await getPermissions(event, false);
  const itHasPermission = permissions.includes(permissionName);
  if (throwError && !itHasPermission) throw createError({ status: 403, statusText: 'Missing permissions to perform this action' });
  return permissions.includes(permissionName);
}

export async function updateCurrentUserPassword(event: EventUserSession, oldPassword: string, newPassword: string) {
  const session = await needAuth(event);
  const accountsModel = useAgentAccountsModel();
  const account = await accountsModel.getById(session.user!.id as string);
  // Verify user's old password
  const isValid = await accountsModel.verifyPassword(account, oldPassword);
  if (!isValid) throw createError({ status: 403, statusText: 'Your current password is incorrect.' });
  // If we reach this point, the old password is correct, so we can update to the new password
  await accountsModel.updatePassword(account._id.toString(), newPassword);
  return true;
};

export async function updateCurrentUserProfile(event: EventUserSession, profileUpdateData: Record<string, any>) {
  const session = await needAuth(event);
  const accountsModel = useAgentAccountsModel();
  const allowedFields = _.pick(profileUpdateData, ['displayName']);
  await accountsModel.updateOne(session.user!.id as string, allowedFields);
  await setUserSession(event as H3Event, {
    user: { displayName: allowedFields.displayName }
  });
  return true;
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

// Secured WebAuthn challenge

export async function setWebauthnChallenge(event: EventUserSession, { challenge, attemptId }: { challenge: string, attemptId: string }) {
  await setUserSession(event as H3Event, {
    secure: { webauthnChallenges: { [attemptId]: challenge } }
  });
};

export async function getWebauthnChallenge(event: EventUserSession, attemptId: string) {
  const session = await needAuth(event);
  const challenge = session?.secure?.webauthnChallenges?.[attemptId];
  if (!challenge) throw createError({ status: 400, statusText: 'No WebAuthn challenge found for the given attempt ID.' });
  return challenge;
};

export async function clearWebauthnChallenge(event: EventUserSession, attemptId: string) {
  const session = await needAuth(event);
  if (session?.secure?.webauthnChallenges?.[attemptId]) {
    delete session.secure.webauthnChallenges[attemptId];
    await setUserSession(event as H3Event, {
      secure: { webauthnChallenges: session.secure.webauthnChallenges }
    });
  }
};