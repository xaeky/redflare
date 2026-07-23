import { AvatarBaseFlagsType } from "~~/shared/enums/Commissions";

export default defineEventHandler(async () => {
  const result = await useAvatarBasesModel().getAllCached(AvatarBaseFlagsType.None);
  return result;
});