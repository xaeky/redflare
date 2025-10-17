import { EventHandlerRequest, H3Event } from 'h3';

export const validateCommission = async (event: H3Event<EventHandlerRequest>) => {
  const commissionId = getRouterParam(event, 'id');
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  const commissionsModel = useCommissionModel();
  if (await commissionsModel.existsOne(commissionId) === false) throw createError({ statusCode: 404, message: 'Commission not found' });
  return commissionId;
}
