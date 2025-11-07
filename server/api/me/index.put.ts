export default defineEventHandler(async (event) => {
  const body = await readBody<{ nickname?: string }>(event);
  // Remove password if present
  if ('password' in body) delete body.password;
  if (!body || Object.keys(body).length === 0) throw createError({ statusCode: 400, statusMessage: 'At least one field to update must be provided' });
  await updateCurrentUserProfile(event, body);
  return { success: true };
});