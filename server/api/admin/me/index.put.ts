export default defineEventHandler(async (event) => {
  const { data: newProfile, error: errorProfile } = await readValidatedBody(
    event,
    agentAccountProfilePutSchema.safeParse,
  );
  if (!newProfile || errorProfile)
    throw createError({ status: 400, statusText: 'Invalid body' });
  await needConfirmationIntent(event, 'profile:update');
  await updateCurrentUserProfile(event, newProfile);
  return { success: true };
});
