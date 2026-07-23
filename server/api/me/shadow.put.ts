export default defineEventHandler(async (event) => {
  const body = await readBody<{ newPassword: string, oldPassword: string }>(event);
  if (!body?.newPassword || !body?.oldPassword) {
    throw createError({ status: 400, statusText: 'Old and new passwords are required' });
  }
  await updateCurrentUserPassword(event, body.oldPassword, body.newPassword);
  return { success: true };
});