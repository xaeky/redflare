import _ from 'lodash';
import { AvatarBaseFlagsType } from '~~/shared/enums/Commissions';

export default defineEventHandler(async () => {
  const result = await useAvatarBasesModel().getAllCached(AvatarBaseFlagsType.Private);
  _.forEach(result, (base) => {
    delete (base as Partial<typeof base>)._id;
  });
  return result;
});