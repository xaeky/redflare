export default defineEventHandler(async (event) => {
  const body = await readBody<{ id: string }>(event);
  if (!body || !body.id) throw createError({ statusCode: 400, message: 'No file ID provided' });
  try {
    await bucketDeleteFile(body.id);
    return { success: true };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message || 'Failed to delete file' });
  }
});