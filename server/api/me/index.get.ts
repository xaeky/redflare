export default defineEventHandler(async (event) => {
  const session = await needAuth(event);
  const currentUserProfile = {
    displayName: session.user?.displayName || null,
    username: session.user?.username as string
  } satisfies AgentAccountProfile;
  return currentUserProfile;
});