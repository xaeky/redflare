import _ from "lodash";

export default defineEventHandler(async (event) => {
  const query = await getQuery<{ file_id: string }>(event);
  if (!query.file_id || !query.file_id.length) throw createError({ statusCode: 400, statusMessage: 'No file_id provided' });
  const decodedFileId = Buffer.from(query.file_id, 'base64').toString('utf-8');
  const expectedAuth = `retrieve_commission_attachment:${decodedFileId}`;

  if (!(await publicHasTempAuthorization(event, expectedAuth))) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized to access attachment' });
  }
  
  const file = useStorageBucket().file(decodedFileId);
  const [exists] = await file.exists();
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'File not found' });
  const [{ metadata }] = await file.getMetadata();

  await publicRevokeTempAuthorization(event, expectedAuth);

  // Create read stream and pipe to response
  setHeader(event, 'Content-Disposition', `attachment; filename="${metadata?.originalName}"`);
  setHeader(event, 'Content-Type', 'application/octet-stream');
  const readStream = file.createReadStream();
  return sendStream(event, readStream);
});