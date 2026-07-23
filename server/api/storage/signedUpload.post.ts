import { ObjectId } from 'mongodb';

export default defineEventHandler(async (event) => {
  let { destinationPrefix, fileName, fileContentType } = await readBody(event);
  if (!destinationPrefix) throw createError({ status: 400, statusText: 'No destination prefix provided' });
  const fileId = ObjectId.createFromTime(Math.floor(Date.now() / 1000));
  destinationPrefix = destinationPrefix.replace(/\//g, ''); // Remove slashes if any
  const destinationPath = `${destinationPrefix}/${fileId.toString()}`;
  try {
    const url = await bucketGetSignedUploadUrl({ destinationPath, fileName, expiresInSeconds: 3600, contentType: fileContentType });
    return { success: true, url, id: fileId.toString() };
  } catch (error) {
    logger.error('Error getting signed upload URL:', error);
    throw createError({ status: 500, statusText: 'Failed to get signed upload URL' });
  }
});