import _ from "lodash";

export default defineEventHandler(async (event) => {
  const query = getQuery<{ file_id: string }>(event);
  if (!query.file_id || !query.file_id.length) throw createError({ status: 400, statusText: 'No file_id provided' });
  const fileId = query.file_id;
  const expectedAuth = `retrieve_commission_attachment:${fileId}`;
  if (!(await publicHasTempAuthorization(event, expectedAuth))) {
    throw createError({ status: 403, statusText: 'Unauthorized to access attachment' });
  }
  const destinationPath = `avatars/${fileId}`;
  const url = await bucketGetSignedDownloadUrl(destinationPath).catch((error) => {
    logger.error('Error generating signed download URL', { destinationPath, error: error.message });
    throw createError({ status: 500, statusText: 'Failed to generate download URL' });
  });
  event.context.audit = {
    file_id: fileId,
  };
  await publicRevokeTempAuthorization(event, expectedAuth);
  sendRedirect(event, url);
});