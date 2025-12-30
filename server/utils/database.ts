import { EventHandlerRequest, H3Event } from 'h3';

export const validateCommission = async (event: H3Event<EventHandlerRequest>, returnData?: boolean, forceAgentView?: boolean) => {
  let data;
  const publicSession = await getPublicUserSession(event);
  const agentSession = await getUserSession(event);
  const commissionModel = useCommissionModel();
  const customerModel = useCustomerModel();
  const commissionId = getRouterParam(event, 'commission_id') as string;
  if (forceAgentView && returnData) {
    const data = await commissionModel.getOneById(commissionId as string, 'agent');
    return { id: commissionId, data };
  }
  const currentCustomerUser = publicSession.user ? await customerModel.getByDiscordId(publicSession?.user?.id || '') : null;
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  let isOwner = currentCustomerUser ? await commissionModel.checkOwnershipFromOne(commissionId, currentCustomerUser?._id.toString() as string) : false;
  // Override isOwner if agent is logged in and their settings allow it
  const agentViewModeIsForced = await getCurrentUserSetting(event, 'forceAgentView');
  if (agentSession.user && agentViewModeIsForced) isOwner = true;
  let viewAs: ViewAs = isOwner ? 'customer' : 'anon';
  if (await commissionModel.existsOne(commissionId) === false) throw createError({ statusCode: 404, message: 'Commission not found' });
  if (returnData) data = await commissionModel.getOneById(commissionId, viewAs);
  return { id: commissionId, data, viewAs };
}
