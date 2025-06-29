export default defineEventHandler(async (event) => {
  await hasPermission(event, 'write:commissions_characters');
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'id');
  // Ensure commission ID is provided
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  // Read the validated body from the event
  const body = await readValidatedBody(event, commissionCharacterOptionsSchema.safeParse);
  if (!body.success) throw createError({ statusCode: 400, message: 'Invalid body' });
  // Check if commission exists
  const commissionExists = await ($supabase()).from('commissions').select('id').eq('id', commissionId).single();
  if (commissionExists.error || !commissionExists.data) throw createError({ statusCode: 404, message: 'Commission not found' });
  // Prepare the character object
  const { name, note, changelog, base } = body.data;
  // Ensure changelog is an object, default to empty object if not provided
  const curatedChangelog = typeof changelog === 'object' ? changelog : {};
  const characterObject:CommissionCharacterOptions = {
    commission: commissionId, base, name, note,
    changelog: curatedChangelog
  }
  // Insert the character into the database
  const { data, error } = await ($supabase()).from('commissions_characters')
    .insert(characterObject).select('*').single();
  if (error) throw createError({ statusCode: 500, message: 'Failed to create character', data: error });
  // Return the created character
  return data;
});