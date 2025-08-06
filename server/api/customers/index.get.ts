export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to read customers.
  await hasPermission(event, 'read:customers', true);
  // Set objects and parameters for the request.
  let { page, name, sort_by, sort_order } = getQuery(event);
  const filters: Partial<CustomerFilterOptions> = {
    name: name ? String(name) : undefined
  };
  sort_by ||= 'created_at';
  sort_order = (sort_order === '1' || sort_order === '-1') ? Number(sort_order) : -1;
  const sort = (sort_by && sort_order) ? { by: String(sort_by), order: Number(sort_order) as 1 | -1 } : undefined;
  // Get all customers with pagination and filters.
  const content = await useCustomerModel().getAll({
    page: Number(page) || 1,
    filters, sort
  });
  return content;
});
