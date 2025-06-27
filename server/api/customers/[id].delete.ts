export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to delete customers.
  await hasPermission(event, 'delete:customers', true);
  // Get customer ID
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400 });
  // Delete it
  const content = await ($supabase())
    .from('customers')
    .delete()
    .eq('id', id);
  if (content.error) throw createError({ statusCode: 500, data: content.error });
  return content.data;
});