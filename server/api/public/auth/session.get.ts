export default defineEventHandler(async (event) => {
  const publicSession = await getPublicUserSession(event);
  const { user, id } = publicSession;
  return { user, id };
});