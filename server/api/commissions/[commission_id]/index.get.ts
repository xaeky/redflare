export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to read commissions.
  await hasPermission(event, 'read:commissions', true);
  const { data } = await validateCommission(event, true, true);
  return data;
});