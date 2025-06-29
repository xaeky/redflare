export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to read customers.
  await hasPermission(event, 'read:customers', true);
  // @TODO: Add pagination to this endpoint as project will might scale over time.
  // Read database and return all customers, get commissions counts as well.
  const content = await ($supabase()).from('customers').select('*, commissions_count:commissions(count)');
  if (content.error) throw createError({ statusCode: 500, data: content.error });
  return content.data;
});
