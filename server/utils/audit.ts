import { AuditInsertOptions, WithoutAuthor } from '~~/shared/types/Audit';
import { H3Event } from 'h3';

export const auditOperation = async (event: H3Event, audit: WithoutAuthor<AuditInsertOptions>) => {
  const agentSession = await getUserSession(event);
  await useAuditModel().insertOne({
    author_id: agentSession.user?.sub as string,
    author_nickname: agentSession.user?.nickname as string,
    ...audit,
  });
};

export const auditPublicOperation = async (event: H3Event, audit: WithoutAuthor<AuditInsertOptions>) => {
  const publicSession = await getPublicUserSession(event);
  const agentSession = await getUserSession(event);
  const authorId = publicSession.user?.id || agentSession.user?.sub;
  const authorNickname = publicSession.user?.username || agentSession.user?.nickname;
  if (!authorId || !authorNickname) {
    throw createError({ status: 500, statusText: 'Failed to retrieve author information for audit' });
  }
  await useAuditModel().insertOne({
    author_id: authorId as string,
    author_nickname: authorNickname as string,
    ...audit,
  });
};