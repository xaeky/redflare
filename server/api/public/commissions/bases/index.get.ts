import _ from 'lodash';

export default defineEventHandler(async (event) => {
  const result = await useAvatarBasesModel().getAll(true);
  // Delete the `id` field from each base
  _.forEach(result, (base) => {
    delete (base as Partial<typeof base>)._id;
  });
  return result;
});