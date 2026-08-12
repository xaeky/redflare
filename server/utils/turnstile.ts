import { z } from 'zod';
import type { H3Event } from 'h3';
import type { Secret } from '@infisical/sdk';

export const verifyTurnstileToken = async (token: string): Promise<TurnstileValidationResponse> => {
  if (!token) throw createError({ status: 400, message: 'Turnstile token is required.' });
  let turnstileSecretKey: Secret;
  try {
    turnstileSecretKey = await (await useInfisical()).getSecret('TURNSTILE_SECRET_KEY');
  } catch (error) {
    logger.withTag('turnstile').error('Failed to retrieve Turnstile secret key from Infisical', error);
    throw createError({ status: 500, message: 'Failed to retrieve Turnstile secret key.' });
  }
  return await $fetch<TurnstileValidationResponse>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: turnstileSecretKey.secretValue,
      response: token,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  });
};

export const needTurnstileVerification = async (event: H3Event<EventHandlerRequest>) => {
  const { data, error } = await readValidatedBody(event, z.object({ turnstileToken: z.string() }).safeParse);
  if (!data || error) throw createError({ status: 400, message: 'Turnstile token is required.' });
  const tokenResponse = await verifyTurnstileToken(data.turnstileToken);
  if (!tokenResponse.success) {
    logger.withTag('turnstile').error('Turnstile verification failed', tokenResponse['error-codes']);
    throw createError({ status: 403, message: 'Invalid Turnstile token.' });
  };
  return true;
};