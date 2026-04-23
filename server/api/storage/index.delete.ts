export default defineEventHandler(async (event) => {
  const body = await readBody<{ id: string, fileType: 'avatarFile', bucketType: 'temp' | 'default' }>(event);
  if (!body || !body.id) throw createError({ statusCode: 400, message: 'No object ID provided' });
  logger.debug('Received request to delete file', { fileId: body.id, bucketType: body.bucketType });
  let destinationPath: string;
  if (body.fileType === 'avatarFile') {
    destinationPath = `avatars/${body.id}`;
  } else {
    throw createError({ statusCode: 400, message: 'Invalid file type' });
  }
  try {
    await bucketDeleteFile(destinationPath, body.bucketType);
    return { success: true };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message || 'Failed to delete file' });
  }
});