import { EventHandlerRequest, H3Event } from 'h3';

export const validateCommission = async (event: H3Event<EventHandlerRequest>, returnData?: boolean) => {
  let data;
  const commissionId = getRouterParam(event, 'commission_id');
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  console.log('huh?')
  const commissionsModel = useCommissionModel();
  if (await commissionsModel.existsOne(commissionId) === false) throw createError({ statusCode: 404, message: 'Commission not found' });
  if (returnData) data = await commissionsModel.getOneById(commissionId);
  return { id: commissionId, data };
}
