export default defineEventHandler(async (event) => {
  const body = await readBody<{ id: string, fileType: 'avatarFile', bucketType: 'temp' | 'default' }>(event);
  if (!body || !body.id) throw createError({ status: 400, statusText: 'No object ID provided' });
  logger.debug('Received request to delete file', { fileId: body.id, bucketType: body.bucketType });
  let destinationPath: string;
  if (body.fileType === 'avatarFile') {
    destinationPath = `avatars/${body.id}`;
  } else {
    throw createError({ status: 400, statusText: 'Invalid file type' });
  }
  try {
    await bucketDeleteFile(destinationPath, body.bucketType);
    return { success: true };
  } catch (error: any) {
    throw createError({ status: 500, statusText: error.message || 'Failed to delete file' });
  }
});