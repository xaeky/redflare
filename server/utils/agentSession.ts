import _ from 'lodash';
import { useSession, createError, H3Event } from 'h3';
import cache from './cache';

type EventUserSession = Parameters<typeof useSession>[0];

export async function needAuth(event: EventUserSession) {
  // Get user session, check if defined or not, if not throw 401 error
  const userSession = await getUserSession(event);
  // On test environment, skip auth checks
  if (isTestEnv) return userSession;
  if (!_.get(userSession, 'user.id')) throw createError({ status: 401, message: 'Your user has not an ID.' });
  const userId = userSession.user!.id as string;
  // Validate the account still exists, cached briefly to avoid a Mongo hit on every request.
  // NOTE: lockout (`isLockedOut`) is intentionally NOT re-checked here — it only gates new
  // logins (see server/api/auth/login.post.ts). An already active session must keep working
  // even if the account gets locked out afterwards (e.g. someone else brute-forcing the login
  // form shouldn't be able to kick the legitimate user out of their current session).
  const cacheKey = `agent-account-${userId}`;
  let cachedSession = await cache.get<boolean>(cacheKey);
  if (!cachedSession) {
    const accountsModel = useAgentAccountsModel();
    const account = await accountsModel.getById(userId).catch(() => null);
    if (!account) {
      clearUserSession(event as H3Event);
      throw createError({ status: 403, message: 'Your account no longer exists.' });
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
  if (!session.user) throw createError({ status: 500, message: 'Could not read user from the session key.' });
  if (!useTrustedSession) return (session.user.permissions || []) as Permission[];
  // Re-pull permissions from Mongo so admin-driven changes propagate without requiring re-login
  const account = await useAgentAccountsModel().getById(session.user.id as string);
  return (account.permissions || []) as Permission[];
}

export async function hasPermission(event: EventUserSession, permissionName: Permission, throwError?: boolean) {
  const permissions = await getPermissions(event, false);
  const itHasPermission = permissions.includes(permissionName);
  if (throwError && !itHasPermission) throw createError({ status: 403, message: 'Missing permissions to perform this action' });
  return permissions.includes(permissionName);
}

export async function updateCurrentUserPassword(event: EventUserSession, oldPassword: string, newPassword: string) {
  const session = await needAuth(event);
  const accountsModel = useAgentAccountsModel();
  const account = await accountsModel.getById(session.user!.id as string);
  // Verify user's old password
  const isOldValid = await accountsModel.verifyPassword(account, oldPassword);
  if (!isOldValid) throw createError({ status: 403, message: 'Your current password is incorrect.' });
  // Validate new password against schema
  const isNewValid = agentAccountPasswordSchema.safeParse(newPassword);
  if (!isNewValid.success) throw createError({ status: 400, message: isNewValid.error.errors[0]?.message });
  // If we reach this point, the old password is correct, so we can update to the new password
  await accountsModel.updatePassword(account._id.toString(), newPassword);
  return true;
};

export async function updateCurrentUserProfile(event: EventUserSession, profileUpdateData: Record<string, any>) {
  const session = await needAuth(event);
  const accountsModel = useAgentAccountsModel();
  const allowedFields = _.pick(profileUpdateData, ['displayName', 'username']);
  await accountsModel.updateOne(session.user!.id as string, allowedFields);
  await setUserSession(event as H3Event, {
    user: { displayName: allowedFields.displayName, username: allowedFields.username }
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
  if (!challenge) throw createError({ status: 400, message: 'No WebAuthn challenge found for the given attempt ID.' });
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

// Confirmations

/**
 * Record an intent of confirmation in the cache for a specific (critical) action.
 * Returns an opaque token that can be used to retrieve the intent later.
 * The intent will expire after a short period (e.g., 2 minutes) to prevent replay attacks.
 * The token should be sent to the client and included in the confirmation request.
 */
export async function recordConfirmationIntent(event: EventUserSession, newIntent: AgentConfirmIntentCreateOptions) {
  const opaqueToken = Bun.randomUUIDv7();
  const cacheKey = `confirmation-intent-${opaqueToken}`;
  const confirmationIntent: AgentConfirmIntent = {
    ...newIntent,
    accountId: (await needAuth(event)).user!.id as string,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes from now
    confirmed: false,
    confirmedAt: null,
    confirmationToken: opaqueToken
  };
  const confirmationCache = useConfirmationCache();
  await confirmationCache.set<AgentConfirmIntent>(cacheKey, confirmationIntent);
  logger.withTag('confirmation').debug(`Recorded confirmation intent for action "${newIntent.action}" with token: ${opaqueToken}`);
  return opaqueToken;
}

/**
 * Approve a confirmation intent for a specific action using the provided token.
 */
export async function approveConfirmationIntent(event: EventUserSession, token: string) {
  const confirmationCache = useConfirmationCache();
  const cacheKey = `confirmation-intent-${token}`;
  const intent = await confirmationCache.get<AgentConfirmIntent>(cacheKey);
  if (!intent) throw createError({ status: 400, message: 'No confirmation intent found for the given token.' });
  if (new Date(intent.expiresAt) <= new Date()) {
    await confirmationCache.remove(cacheKey);
    throw createError({ status: 400, message: 'The confirmation intent has expired.' });
  };
  intent.confirmed = true;
  intent.confirmedAt = new Date().toISOString();
  await confirmationCache.set<AgentConfirmIntent>(cacheKey, intent);
  return true;
};

/**
 * Look for recent confirmation intent for a specific action, if it exists and is valid, destroy it and return true.
 * If token is provided but the intent is expired, destroy it and return false.
 * If no token is provided, create a new intent and return the new opaque token.
 */
export async function needConfirmationIntent(event: H3Event, action: string): Promise<boolean | string> {
  // Get token through Headers
  const token = getHeader(event, 'x-rf-confirmation-token') || undefined;
  const confirmationCache = useConfirmationCache();
  // If a token is provided, it means the user was prompted for confirmation before, and their intent is now confirmed.
  // We should check if the token is valid and corresponds to the expected action. If it does, we can clear the intent from the cache and return true.
  if (token) {
    const cacheKey = `confirmation-intent-${token}`;
    const intent = await confirmationCache.get<AgentConfirmIntent>(`confirmation-intent-${token}`);
    // If the intent exists, matches the action, but has expired, we should clear it from the cache and return false.
    if (intent && intent.action === action && new Date(intent.expiresAt) <= new Date()) {
      await confirmationCache.remove(cacheKey);
      return false;
    }
    // If the intent exists, matches the action, and hasn't expired, we can consider it valid.
    if (intent && intent.action === action && new Date(intent.expiresAt) > new Date()) {
      await confirmationCache.remove(cacheKey);
      return true;
    }
  }
  // If no valid intent was found, we should create a new intent and return false.
  const newIntent: AgentConfirmIntentCreateOptions = {
    action
  };
  // Return the opaque token to the client so they can use it to confirm the action.
  const opaqueToken = await recordConfirmationIntent(event, newIntent);
  throw createError({ status: 428, message: 'Confirmation required', data: { confirmationToken: opaqueToken } });
}