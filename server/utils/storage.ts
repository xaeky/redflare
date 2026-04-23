import { type FileMetadata, Storage } from '@google-cloud/storage';

const getBucketName = (bucketType: 'default' | 'temp' = 'default') => {
  const buckets = {
    default: process.env.GCP_BUCKET_AVATARFILES_NAME,
    temp: process.env.GCP_BUCKET_AVATARFILES_TEMP_NAME
  }
  const nameProvided = buckets[bucketType];
  if (!nameProvided || !nameProvided.length) {
    throw new Error('No bucket name provided');
  }
  return nameProvided;
}

export const useStorageBucket = (bucketType: 'default' | 'temp' = 'default') => {
  const bucketName = getBucketName(bucketType);
  const keyFilename = process.env.GCP_PROJECT_SERVICE_KEY_PATH;
  const storage = new Storage({ keyFilename });
  return storage.bucket(bucketName);
}

type BucketUploadOptions = {
  destinationPath: string;
  fileBuffer: Buffer;
  metadata?: Record<string, any>;
};

type BucketSignedUploadUrlOptions = {
  destinationPath: string;
  fileName?: string;
  metadata?: Record<string, any>;
  expiresInSeconds?: number;
  contentType?: string;
};

export const bucketGetSignedUploadUrl = async ({ destinationPath, fileName, expiresInSeconds = 3600, contentType = 'application/octet-stream' }: BucketSignedUploadUrlOptions) => {
  const bucket = useStorageBucket('temp');
  const file = bucket.file(destinationPath);
  const [url] = await file.getSignedUrl({
    action: 'write',
    expires: Date.now() + expiresInSeconds * 1000,
    contentType: contentType,
    extensionHeaders: {
      'x-goog-meta-originalname': fileName || 'unknown'
    }
  }).catch((error) => {
    throw new Error(`Failed to get signed URL for file ${destinationPath}: ${error.message}`);
  });
  logger.info('Generated signed upload URL', { destinationPath, expiresInSeconds, contentType, fileName });
  return url;
}

/**
 * Note: This method only creates a signed URL for the permanent bucket. Use bucketMoveFileToPermanent
 * to move the file from temp to permanent bucket after upload and then generate signed URL for the permanent bucket.
 */
export const bucketGetSignedDownloadUrl = async (destinationPath: string, expiresInSeconds = 3600) => {
  const bucket = useStorageBucket('default');
  const file = bucket.file(destinationPath);
  // Check if file exists before generating signed URL to avoid generating URLs for non-existent files
  const [exists] = await file.exists();
  if (!exists) {
    logger.warn('File not found in bucket when attempting to generate signed download URL', { destinationPath });
    throw new Error('File not found');
  }
  // Get metadata to determine original filename for content disposition
  const [metadata] = await file.getMetadata().catch((error) => {
    throw new Error(`Failed to get metadata for file ${destinationPath}: ${error.message}`);
  });
  const originalFilename = metadata?.metadata?.originalname || 'attachment';
  const contentDisposition = `attachment; filename="${originalFilename}"`;
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInSeconds * 1000,
    responseDisposition: contentDisposition
  }).catch((error) => {
    throw new Error(`Failed to get signed download URL for file ${destinationPath}: ${error.message}`);
  });
  logger.info('Generated signed download URL', { destinationPath, expiresInSeconds });
  return url;
}

export const bucketMoveFileToPermanent = async (filePath: string) => {
  const tempBucket = useStorageBucket('temp');
  const permanentBucket = useStorageBucket('default');
  const destinationPath = filePath;
  const tempFile = tempBucket.file(destinationPath);
  const permanentFile = permanentBucket.file(destinationPath);
  await tempFile.move(permanentFile).catch((error) => {
    throw new Error(`Failed to move file from temp to permanent bucket: ${error.message}`);
  });
  return { id: filePath };
}

/**
 * @deprecated Use bucketGetSignedUploadUrl instead and upload file directly to the bucket from the client.
 */
export const bucketUploadFile = async ({ destinationPath, fileBuffer, metadata }: BucketUploadOptions) => {
  const bucket = useStorageBucket();
  const file = bucket.file(destinationPath);
  await file.save(fileBuffer).catch((error) => {
    throw new Error(`Failed to upload file to bucket: ${error.message}`);
  });
  await file.setMetadata({ metadata }).catch((error) => {
    throw new Error(`Failed to set metadata for file ${destinationPath}: ${error.message}`);
  });
  const fileId = Buffer.from(destinationPath).toString('base64');
  
  return { id: fileId, storageId: file.id };
}

export const bucketDeleteFile = async (destinationPath: string, bucketType: 'default' | 'temp' = 'default') => {
  const bucket = useStorageBucket(bucketType);
  const file = bucket.file(destinationPath);
  await file.delete().catch((error) => {
    throw new Error(`Failed to delete file from bucket: ${error.message}`);
  });
  return true;
}

export const bucketFilesExists = async (destinationPaths: string[], bucketType: 'default' | 'temp' = 'default'): Promise<Record<string, boolean>> => {
  const bucket = useStorageBucket(bucketType);
  const existenceResults: Record<string, boolean> = {};
  for (const destinationPath of destinationPaths) {
    const file = bucket.file(destinationPath);
    const [exists] = await file.exists().catch((error) => {
      throw new Error(`Failed to check existence of file ${destinationPath} in bucket: ${error.message}`);
    });
    existenceResults[destinationPath] = exists;
  }
  return existenceResults;
}

export const bucketGetFilesDetails = async (fileIds: string[], bucketType: 'default' | 'temp' = 'default'): Promise<Record<string, FileMetadata>> => {
  logger.debug('Fetching file details from bucket', { fileIds, bucketType });
  const bucket = useStorageBucket(bucketType);
  const files: Record<string, FileMetadata> = {};
  // TODO: Cache files metadata to reduce API calls
  for (const fileId of fileIds) {
    const file = bucket.file(fileId);
    const [metadata] = await file.getMetadata().catch((error) => {
      logger.warn('Failed to get metadata for file', { fileId, error });
    });
    files[fileId] = metadata;
  }
  return files;
}