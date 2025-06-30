export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to read commissions.
  await hasPermission(event, 'read:commissions');
  // Get & read database
  const rawCommissions = await ($supabase()).rpc('get_all_commissions');
  if (rawCommissions.error) throw createError({ statusCode: 500, data: rawCommissions.error });
  return rawCommissions.data;
});