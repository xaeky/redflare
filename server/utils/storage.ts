import { type FileMetadata, Storage } from '@google-cloud/storage';

const tryParseJson = (value: string) => {
  try {
    const parse = JSON.parse(value);
    return parse;
  } catch(e) {
    return false;
  }
};

// For development environment, we use base64 encoded JSON credentials
// In production, we rely on GCP Secret Manager.
const safeParseCredentials = (value: string) => {
  if (!value || !value.length) throw new Error('No storage credentials provided');
  const jsonString = Buffer.from(value, 'base64').toString('utf-8').replace(/\n/g, '\\n');
  const parsed = tryParseJson(jsonString);
  if (!parsed) throw new Error('Failed to parse storage credentials');
  return parsed;
};

const getBucketName = () => {
  const runtime = useRuntimeConfig();
  const nameProvided = runtime.bucket.name || process.env.NUXT_BUCKET_NAME;
  if (!nameProvided || !nameProvided.length) {
    throw new Error('No bucket name provided');
  }
  return nameProvided;
}

export const useStorageBucket = () => {
  const runtime = useRuntimeConfig();
  const bucketName = getBucketName();
  const bucketAuth = runtime.bucket.auth || process.env.NUXT_BUCKET_AUTH || '';
  const storage = new Storage({
    credentials: safeParseCredentials(bucketAuth)
  });
  return storage.bucket(bucketName);
}

type BucketUploadOptions = {
  destinationPath: string;
  fileBuffer: Buffer;
  metadata?: Record<string, any>;
};

export const bucketUploadFile = async ({ destinationPath, fileBuffer, metadata }: BucketUploadOptions) => {
  const bucket = useStorageBucket();
  const file = bucket.file(destinationPath);
  await file.save(fileBuffer).catch((error) => {
    throw new Error(`Failed to upload file to bucket: ${error.message}`);
  });
  await file.setMetadata({ metadata }).catch((error) => {
    throw new Error(`Failed to set metadata for file: ${error.message}`);
  });
  const fileId = Buffer.from(destinationPath).toString('base64');
  return { id: fileId, storageId: file.id };
}

export const bucketDeleteFile = async (fileId: string) => {
  const bucket = useStorageBucket();
  const destinationPath = Buffer.from(fileId, 'base64').toString('utf-8');
  const file = bucket.file(destinationPath);
  await file.delete().catch((error) => {
    throw new Error(`Failed to delete file from bucket: ${error.message}`);
  });
  return { success: true };
}

export const bucketGetFilesDetails = async (fileIds: string[]): Promise<Record<string, FileMetadata>> => {
  const bucket = useStorageBucket();
  const files: Record<string, FileMetadata> = {};
  // TODO: Cache files metadata to reduce API calls
  for (const fileId of fileIds) {
    const destinationPath = Buffer.from(fileId, 'base64').toString('utf-8');
    const file = bucket.file(destinationPath);
    const [metadata] = await file.getMetadata().catch((error) => {
      throw new Error(`Failed to get metadata for file ${fileId}: ${error.message}`);
    });
    files[fileId] = metadata;
  }
  return files;
}