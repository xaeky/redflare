import _ from "lodash";

export default defineEventHandler(async (event) => {
  const query = await getQuery<{ file_id: string }>(event);
  if (!query.file_id || !query.file_id.length) throw createError({ statusCode: 400, statusMessage: 'No file_id provided' });
  const fileId = query.file_id;
  const expectedAuth = `retrieve_commission_attachment:${fileId}`;
  if (!(await publicHasTempAuthorization(event, expectedAuth))) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized to access attachment' });
  }
  const destinationPath = `avatars/${fileId}`;
  const url = await bucketGetSignedDownloadUrl(destinationPath).catch((error) => {
    logger.error('Error generating signed download URL', { destinationPath, error: error.message });
    throw createError({ statusCode: 500, statusMessage: 'Failed to generate download URL' });
  });
  await publicRevokeTempAuthorization(event, expectedAuth);
  sendRedirect(event, url);
});