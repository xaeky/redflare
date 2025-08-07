import _ from 'lodash';

export default defineEventHandler(async (event) => {
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'cid');
  // Ensure commission ID is provided
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  const data = await useCommissionModel().getOneById(commissionId);
  if (!data) throw createError({ statusCode: 404, message: 'Commission not found' });
  const sanitizedPublicData = _.omit(data, ['secure_note'])
  // Return commission data
  return sanitizedPublicData;
});