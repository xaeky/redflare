import { type StorageMeta, createStorage } from "unstorage";
import s3Driver from "unstorage/drivers/s3";
import { AwsClient } from "aws4fetch";

const getEndpoint = () => {
  const endpoint = process.env.S3_ENDPOINT;
  if (!endpoint || !endpoint.length) {
    throw new Error('No S3 endpoint provided');
  }
  return /^https?:\/\//i.test(endpoint) ? endpoint : `https://${endpoint}`;
}

const getBucketName = (bucketType: 'default' | 'temp' = 'default') => {
  const buckets = {
    default: process.env.S3_BUCKET_AVATARFILES,
    temp: process.env.S3_BUCKET_AVATARFILES_TEMP
  }
  const nameProvided = buckets[bucketType];
  if (!nameProvided || !nameProvided.length) {
    throw new Error('No bucket name provided');
  }
  return nameProvided;
}

const buildContentDisposition = (fileName: string) => {
  const asciiFallback = fileName.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, "'");
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export const useStorageBucket = (bucketType: 'default' | 'temp' = 'default') => {
  const bucketName = getBucketName(bucketType);
  const storage = createStorage({
    driver: s3Driver({
      accessKeyId: process.env.S3_ACCESS as string,
      secretAccessKey: process.env.S3_SECRET as string,
      endpoint: getEndpoint(),
      bucket: bucketName,
      region: 'auto',
    }),
  });
  return storage;
}

export const useStorageClient = () => {
  const client = new AwsClient({
    service: 's3',
    region: 'auto',
    accessKeyId: process.env.S3_ACCESS as string,
    secretAccessKey: process.env.S3_SECRET as string
  });
  return client;
};

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
  const client = useStorageClient();
  const endpoint = getEndpoint();

  const url = new URL(`${endpoint}/${getBucketName('temp')}/${destinationPath}`);
  url.searchParams.append('X-Amz-Content-Sha256', 'UNSIGNED-PAYLOAD');
  url.searchParams.append('X-Amz-Expires', expiresInSeconds.toString());

  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('x-amz-meta-original-name', fileName || 'unknown');

  const signed = await client.sign(url.toString(), { method: 'PUT', headers, aws: { signQuery: true } });
  return signed.url;
}

export const bucketGetSignedDownloadUrl = async (destinationPath: string, expiresInSeconds = 3600) => {
  const client = useStorageClient();
  const endpoint = getEndpoint();

  const exists = await useStorageBucket('default').hasItem(destinationPath);
  if (!exists) {
    logger.withTag('storage').warn('File not found in bucket when attempting to generate signed download URL', { destinationPath });
    throw createError({ status: 404, statusText: 'File not found' });
  }

  const meta = await bucketFileMetadata(destinationPath, 'default');

  const url = new URL(`${endpoint}/${getBucketName('default')}/${destinationPath}`);
  url.searchParams.append('X-Amz-Expires', expiresInSeconds.toString());
  url.searchParams.append('response-content-disposition', buildContentDisposition(meta['original-name'] as string || 'unknown'));

  const signed = await client.sign(url.toString(), { method: 'GET', aws: { signQuery: true } });
  return signed.url;
}

export const bucketMoveFileToPermanent = async (filePath: string) => {
  const client = useStorageClient();
  const endpoint = getEndpoint();
  const tempBucket = useStorageBucket('temp');
  const permanentBucket = useStorageBucket('default');
  const destinationPath = filePath;
  if ((await permanentBucket.hasItem(destinationPath))) {
    logger.withTag('storage').warn('File already exists in permanent bucket, skipping move', { destinationPath });
    return { id: filePath };
  }
  if (!(await tempBucket.hasItem(destinationPath))) throw createError({ status: 404, statusText: 'File not found in temp bucket' });
  const tempMeta = await tempBucket.getMeta(destinationPath);
  const copyUrl = new URL(`${endpoint}/${getBucketName('default')}/${destinationPath}`);
  const headers = new Headers();
  headers.set('Content-Type', 'application/octet-stream');
  headers.set('x-amz-meta-original-name', tempMeta['original-name'] as string || 'unknown');
  headers.set('x-amz-copy-source', `/${getBucketName('temp')}/${destinationPath}`);
  headers.set('x-amz-metadata-directive', 'REPLACE');
  await client.fetch(copyUrl.toString(), { method: 'PUT', headers });
  await tempBucket.removeItem(destinationPath, { removeMeta: true }).catch((error) => {
    logger.withTag('storage').warn('Failed to remove file from temp bucket after moving to permanent bucket', { filePath, error });
  });

  return { id: filePath };
}

export const bucketDeleteFile = async (destinationPath: string, bucketType: 'default' | 'temp' = 'default') => {
  const bucket = useStorageBucket(bucketType);
  bucket.removeItem(destinationPath, { removeMeta: true }).catch((error) => {
    throw createError({ status: 500, statusText: `Failed to delete file from bucket: ${error.message}` });
  });
  return true;
}

export const bucketFileExists = async (destinationPath: string, bucketType: 'default' | 'temp' = 'default'): Promise<boolean> => {
  const bucket = useStorageBucket(bucketType);
  const exists = await bucket.hasItem(destinationPath);
  return exists;
}

export const bucketFilesExists = async (destinationPaths: string[], bucketType: 'default' | 'temp' = 'default'): Promise<Record<string, boolean>> => {
  const bucket = useStorageBucket(bucketType);
  const existenceMap: Record<string, boolean> = {};
  for (const path of destinationPaths) {
    existenceMap[path] = await bucket.hasItem(path);
  }
  return existenceMap;
}

const getFileSize = async (fileId: string, bucketType: 'default' | 'temp'): Promise<number> => {
  const client = useStorageClient();
  const endpoint = getEndpoint();
  const headUrl = new URL(`${endpoint}/${getBucketName(bucketType)}/${fileId}`);
  const res = await client.fetch(headUrl.toString(), { method: 'HEAD' });
  return Number(res.headers.get('content-length')) || 0;
}

const toAttachmentMeta = (fileId: string, meta: StorageMeta, size: number): CommissionCharacterAttachmentRaw => ({
  id: fileId,
  filename: meta['original-name'] as string || 'unknown',
  filetype: getContentTypeByExtension(meta['original-name'] as string || 'unknown'),
  size,
});

export async function bucketFileMetadata(fileId: string, bucketType?: 'default' | 'temp', sanitized?: false): Promise<StorageMeta>;
export async function bucketFileMetadata(fileId: string, bucketType: 'default' | 'temp', sanitized: true): Promise<CommissionCharacterAttachmentRaw>;
export async function bucketFileMetadata(fileId: string, bucketType: 'default' | 'temp' = 'default', sanitized: boolean = false): Promise<StorageMeta | CommissionCharacterAttachmentRaw> {
  const bucket = useStorageBucket(bucketType);
  const meta = await bucket.getMeta(fileId) as StorageMeta;
  if (!sanitized) return meta;

  const size = await getFileSize(fileId, bucketType);
  return toAttachmentMeta(fileId, meta, size);
}

export async function bucketFilesMetadata(fileIds: string[], bucketType?: 'default' | 'temp', sanitized?: false): Promise<Record<string, StorageMeta>>;
export async function bucketFilesMetadata(fileIds: string[], bucketType: 'default' | 'temp', sanitized: true): Promise<Record<string, CommissionCharacterAttachmentRaw>>;
export async function bucketFilesMetadata(fileIds: string[], bucketType: 'default' | 'temp' = 'default', sanitized: boolean = false): Promise<Record<string, StorageMeta | CommissionCharacterAttachmentRaw>> {
  const bucket = useStorageBucket(bucketType);
  const metadataMap: Record<string, StorageMeta | CommissionCharacterAttachmentRaw> = {};
  for (const fileId of fileIds) {
    const meta = await bucket.getMeta(fileId) as StorageMeta;
    if (!sanitized) {
      metadataMap[fileId] = meta;
      continue;
    }
    const size = await getFileSize(fileId, bucketType);
    metadataMap[fileId] = toAttachmentMeta(fileId, meta, size);
  }
  return metadataMap;
}