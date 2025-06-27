import { $supabase } from "~/server/services/supabase";

export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to read customers.
  await hasPermission(event, 'read:customers', true);
  // Read database and return all customers.
  // @TODO: Add pagination to this endpoint as project will might scale over time.
  const content = await ($supabase()).from('customers').select('*');
  if (content.error) throw createError({ statusCode: 500, data: content.error });
  return content.data;
});
