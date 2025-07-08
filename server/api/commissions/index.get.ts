export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to read commissions.
  await hasPermission(event, 'read:commissions');
  // Get & read database
  // TODO: Sorting, filtering & pagiation
  const rawCommissions = await ($supabase()).rpc('get_all_commissions', { sort_by: 'created_at' });
  if (rawCommissions.error) throw createError({ statusCode: 500, data: rawCommissions.error });
  return rawCommissions.data;
});