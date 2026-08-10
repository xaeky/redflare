export default defineEventHandler(async (event) => {
  const session = await needAuth(event);
  const currentUserProfile = {
    displayName: session.user?.displayName || null,
  } satisfies AgentAccountProfile;
  return currentUserProfile;
});