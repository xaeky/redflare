/**
 * This utility will provide a new session hook that only exposes public user information.
 * This session type can only be used by public users (not admins), public users will use
 * Discord as OAuth provider, so no sensitive information should be stored in the session.
 * We can say there are two types of users in Redflare: Admin Users and Public Users.
 * Public users should not login through Auth0, they should login through Discord OAuth only.
 */

import _ from 'lodash';
import { randomUUID } from 'crypto'
import type { H3Event } from 'h3';

interface PublicSessionData {
  id: string;
  user: DiscordOAuthUser | null;
  secure: Record<string, any>;
}

const initPublicSession = async (event: H3Event) => {
  const runtime = useRuntimeConfig(event);
  const secret = runtime.frontoffice.sessionPassword;
  const session = await useSession<PublicSessionData>(event, {
    name: 'rf_public_session',
    password: secret,
  });
  // Check session.data has the expected properties
  // TODO: Improve session data structure validation with Zod or similar
  const sessionProps = ['id', 'user', 'secure'];
  const hasInvalidProps = _.some(sessionProps, prop => !_.has(session.data, prop));
  if (hasInvalidProps) await session.clear();
  // Verify if session has data or data structure is ok, if not initialize it
  if (_.isEmpty(session.data)) {
    await session.update({
      id: randomUUID(),
      user: null,
      secure: {}
    });
  }
  return session;
}

export const setPublicUserSession = async (event: H3Event, sessionData: Record<string, any>) => {
  const session = await initPublicSession(event);
  await session.update(sessionData);
  return session.data;
}

export const getPublicUserSession = async (event: H3Event) => {
  const session = await initPublicSession(event);
  return session.data;
}

export const clearPublicUserSession = async (event: H3Event) => {
  const session = await initPublicSession(event);
  await session.clear();
}