import { customerOptionsSchema } from "~/server/schemas/Customers";
import { $supabase } from "~/server/services/supabase";

export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to write customers.
  await hasPermission(event, 'write:customers', true);
  // Get customer ID
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400 });
  // Get validated body from request
  const trustedBody = await readValidatedBody(event, customerOptionsSchema.safeParse);
  if (trustedBody.error) throw createError({ statusCode: 400 });
  const body = trustedBody.data;
  // Update customer by ID.
  const content = await ($supabase()).from('customers').update(body).eq('id', id);
  if (content.error) throw createError({ statusCode: 500, data: content.error });
  return content.data;
});
