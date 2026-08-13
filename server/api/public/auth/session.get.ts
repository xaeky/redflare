export default defineEventHandler(async (event) => {
  const publicSession = await getPublicUserSession(event);
  const { user, meta, id } = publicSession;
  return { user, meta, id };
});
