import type {
  CreateSecretResponse,
  DeleteSecretResponse,
  ListSecretsResponse,
  Secret,
  UpdateSecretResponse,
} from '@infisical/sdk';
import { InfisicalSDK } from '@infisical/sdk';

/**
 * Initializes the Infisical SDK with the required configuration.
 */
const infisical = new InfisicalSDK({
  siteUrl: process.env.INFISICAL_SITE_URL,
});

const DEFAULT_ENVIRONMENT = 'runtime';

/**
 * Internal function to handle Infisical authentication and caching of the access token.
 */
const _useInfisicalAuth = async () => {
  const { INFISICAL_CLIENT_ID, INFISICAL_CLIENT_SECRET } = process.env;
  if (!INFISICAL_CLIENT_ID || !INFISICAL_CLIENT_SECRET) {
    throw new Error('Missing Infisical client ID or secret');
  }

  if (infisical.auth().getAccessToken()) return infisical;

  await infisical.auth().universalAuth.login({
    clientId: INFISICAL_CLIENT_ID,
    clientSecret: INFISICAL_CLIENT_SECRET,
  });
  return infisical;
};

/**
 * Provides a set of utility functions to interact with the Infisical SDK, including methods to manage secrets and Infisical SDK instance.
 * This function ensures that the Infisical SDK is properly authenticated and ready for use.
 */
export const useInfisical = async () => {
  const instance = await _useInfisicalAuth();

  async function getSecret(
    secretName: string,
    environment = DEFAULT_ENVIRONMENT,
  ): Promise<Secret> {
    if (!process.env.INFISICAL_PROJECT_ID)
      throw new Error('Missing Infisical project ID');
    return await instance.secrets().getSecret({
      environment,
      secretName,
      projectId: process.env.INFISICAL_PROJECT_ID,
    });
  }

  async function setSecret(
    secretName: string,
    secretValue: string,
    environment = DEFAULT_ENVIRONMENT,
  ): Promise<CreateSecretResponse | UpdateSecretResponse> {
    if (!process.env.INFISICAL_PROJECT_ID)
      throw new Error('Missing Infisical project ID');
    // If the secret already exists, update it; otherwise, create a new secret.
    let alreadyExists = false;
    try {
      await getSecret(secretName, environment); // Check if the secret exists, if not it will throw an error.
      alreadyExists = true;
    } catch (_error) {}

    if (alreadyExists) {
      return await instance.secrets().updateSecret(secretName, {
        environment,
        secretValue,
        projectId: process.env.INFISICAL_PROJECT_ID,
      });
    }

    return await instance.secrets().createSecret(secretName, {
      environment,
      secretValue,
      projectId: process.env.INFISICAL_PROJECT_ID,
    });
  }

  async function deleteSecret(
    secretName: string,
    environment = DEFAULT_ENVIRONMENT,
  ): Promise<DeleteSecretResponse> {
    if (!process.env.INFISICAL_PROJECT_ID)
      throw new Error('Missing Infisical project ID');
    return await instance.secrets().deleteSecret(secretName, {
      environment,
      projectId: process.env.INFISICAL_PROJECT_ID,
    });
  }

  async function listSecrets(
    environment = DEFAULT_ENVIRONMENT,
  ): Promise<ListSecretsResponse> {
    if (!process.env.INFISICAL_PROJECT_ID)
      throw new Error('Missing Infisical project ID');
    return await instance.secrets().listSecrets({
      environment,
      projectId: process.env.INFISICAL_PROJECT_ID,
    });
  }

  return {
    getSecret,
    setSecret,
    deleteSecret,
    listSecrets,
    infisical: await _useInfisicalAuth(),
  };
};
