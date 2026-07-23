export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<AgentUserSettings>>(event);
  if (!body || Object.keys(body).length === 0) throw createError({ status: 400, statusText: 'At least one setting to update must be provided' });
  await replaceCurrentUserSettings(event, body);
  return { success: true };
});