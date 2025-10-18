import _ from 'lodash';

export default defineEventHandler(async (event) => {
  const { data } = await validateCommission(event, true);
  if (!data) throw createError({ statusCode: 404, message: 'Commission not found' });
  // Whitelist public fields
  const sanitizedWhitelistFields:Array<keyof typeof data> = ['_id', 'characters', 'customer', 'created_at', 'updated_at', 'status', 'public_note', 'flags'];
  const sanitizedPublicData = _.pick(data, sanitizedWhitelistFields);
  // Return commission data
  return sanitizedPublicData;
});