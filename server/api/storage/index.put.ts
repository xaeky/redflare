import { ObjectId } from 'mongodb';

export default defineEventHandler(async (event) => {
  return { success: true, message: 'This endpoint is deprecated. Please upload files directly to the bucket using the signed URL endpoint.' };
});