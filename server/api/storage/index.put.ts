import { ObjectId } from 'mongodb';

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);
  if (!form || !form.length) throw createError({ statusCode: 400, message: 'No form data provided' });
  const fileField = form.find(field => field.name === 'file'); // file(buffer)
  if (!fileField || !fileField.data) throw createError({ statusCode: 400, message: 'No file provided' });
  const prefixField = form.find(field => field.name === 'prefix'); // string
  if (!prefixField) throw createError({ statusCode: 400, message: 'No prefix provided' });
  const prefixValue = String(prefixField.data);
  const fileBuffer = Buffer.from(fileField.data);
  const fileId = ObjectId.createFromTime(Math.floor(Date.now() / 1000));
  const destinationPath = `${prefixValue}/${fileId.toString()}`;
  const { id, storageId } = await bucketUploadFile({ destinationPath, fileBuffer, metadata: { originalName: fileField.filename } });
  return { success: true, id, storageId };
});