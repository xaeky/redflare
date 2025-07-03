export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to read customers.
  await hasPermission(event, 'read:customers', true);
  // Read page & name from query params.
  const { page, name } = getQuery(event);
  const pageRangeBase = 50;
  const pageRangeInitial = page ? pageRangeBase * (Number(page) - 1) : 0;
  const pageRangeEnd = pageRangeInitial + pageRangeBase - 1;
  // Read database and return all customers, get commissions counts as well.
  const content = await ($supabase())
  .from('customers')
  .select('*, commissions_count:commissions(count)')
  .like('name', name ? `%${name as string}%` : '*')
  .order('created_at', { ascending: false })
  .range(pageRangeInitial, pageRangeEnd);
  if (content.error) throw createError({ statusCode: 500, data: content.error });
  return content.data;
});
