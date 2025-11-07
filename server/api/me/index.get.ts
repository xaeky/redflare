export default defineEventHandler(async (event) => {
  const session = await needAuth(event);
  return session.user;
});