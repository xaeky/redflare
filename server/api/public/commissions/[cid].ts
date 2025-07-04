export default defineEventHandler(async (event) => {
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'cid');
  // Ensure commission ID is provided
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  const { data, error } = await $supabase()
    .from('commissions').select('id,note:public_note,status,created_at,updated_at,\
      customer:customers(id,name,vrc_id),\
      payments:commissions_payments(*),\
      characters:commissions_characters(id,order_id,name,note,base(id,name,creator_name))')
    .eq('id', commissionId).single();
  if (error) throw createError({ statusCode: 404, data: error });
  // Return commission data
  return data;
});