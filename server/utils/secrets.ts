import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const keyFilename = process.env.NUXT_GCP_PROJECT_SERVICE_KEY_PATH;

const client = new SecretManagerServiceClient({ keyFilename });

export async function getSecret(secretName: string): Promise<string> {
  const projectId = process.env.NUXT_GCP_PROJECT_ID;
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  const [version] = await client.accessSecretVersion({ name });
  const payload = version.payload?.data?.toString();

  if (!payload) throw new Error(`Secret ${secretName} is empty or not found`);

  return payload;
};
