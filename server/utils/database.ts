import type { EventHandlerRequest, H3Event } from 'h3';

export const validateCommission = async (
  event: H3Event<EventHandlerRequest>,
  returnData?: boolean,
  forceAgentView?: boolean,
) => {
  let commissionData: SingleCommissionResponse | null = null;
  const publicSession = await getPublicUserSession(event);
  const agentSession = await getUserSession(event);
  const commissionModel = useCommissionModel();
  const customerModel = useCustomerModel();
  const commissionId = getRouterParam(event, 'commission_id') as string;
  if (forceAgentView && returnData) {
    return {
      id: commissionId,
      data: await commissionModel.getOneById(commissionId as string, 'agent'),
    };
  }
  const currentCustomerUser = publicSession.user
    ? await customerModel.getByDiscordId(publicSession?.user?.id || '')
    : null;
  if (!commissionId)
    throw createError({ status: 400, statusText: 'Commission ID is required' });
  let isOwner =
    currentCustomerUser !== null
      ? await commissionModel.checkOwnershipFromOne(
          commissionId,
          currentCustomerUser?._id.toString() as string,
        )
      : false;
  // Override isOwner if agent is logged in and their settings allow it
  const agentViewModeIsForced = agentSession.user?.id
    ? await getCurrentUserSetting(event, 'forceAgentView')
    : false;
  if (agentSession.user && agentViewModeIsForced) isOwner = true;
  const viewAs: ViewAs = isOwner ? 'customer' : 'anon';
  if ((await commissionModel.existsOne(commissionId)) === false)
    throw createError({ status: 404, statusText: 'Commission not found' });
  if (returnData)
    commissionData = await commissionModel.getOneById(commissionId, viewAs);
  return { id: commissionId, data: commissionData, viewAs };
};
